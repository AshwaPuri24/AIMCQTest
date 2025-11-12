import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in your .env file",
  );
}

// Use a standard pg Pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // You may need this if you're using a self-signed cert in dev,
  // but for a standard local install, it's usually not needed.
  // ssl: {
  //   rejectUnauthorized: false, 
  // },
});

export const db = drizzle(pool, { schema });