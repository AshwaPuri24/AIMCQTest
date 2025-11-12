import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// 1. Setup Session Store
const PgStore = connectPg(session);
const sessionStore = new PgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true, // This will use the 'sessions' table we already have
  tableName: "sessions",
});

// 2. Configure Session Middleware
export const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: true, // Use secure cookies in production
    sameSite: "none",
  },
});

// 3. Configure Passport Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email.toLowerCase());
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        if (!user.hashedPassword) {
          // This user might exist but hasn't set a password
          return done(null, false, { message: "Account setup incomplete." });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        // Exclude password from the user object
        const { hashedPassword, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 4. Serialize/Deserialize User for Sessions
// This tells Passport how to store the user in the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (user) {
      const { hashedPassword, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

// 5. Create an `isAuthenticated` middleware
// This will protect our API routes
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export default {};
