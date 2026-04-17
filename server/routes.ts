import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMCQTest, type MCQQuestion } from "./openai"; // <-- Import MCQQuestion
import { z } from "zod";
import passport from "passport";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isAuthenticated } from "./auth"; // Our new middleware

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName) {
        return res
          .status(400)
          .json({ message: "Email, password, and first name are required." });
      }

      const existingUser = await storage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.upsertUser({
        email: email.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
      });

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        const { hashedPassword, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error in /api/auth/register:", error);
      next(error);
    }
  });

  app.post(
    "/api/auth/login",
    passport.authenticate("local"),
    (req: any, res) => {
      res.json(req.user);
    }
  );

  // SSO endpoint: validates a one-time ticket issued by GradPlacifyr.
  // The frontend calls this after the user lands on /sso?ticket=...
  app.post("/api/auth/sso", async (req, res, next) => {
    try {
      const { ticket } = req.body;
      if (!ticket || typeof ticket !== "string") {
        return res.status(400).json({ message: "Ticket is required." });
      }

      const verifyUrl = process.env.GRADPLACIFYR_VERIFY_URL!;
      const apiKey = process.env.GRADPLACIFYR_INTERNAL_API_KEY!;

      // Server-to-server call: ask GradPlacifyr whether the ticket is valid.
      const gpResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Api-Key": apiKey,
        },
        body: JSON.stringify({ ticket }),
      });

      if (!gpResponse.ok) {
        return res.status(401).json({ message: "Invalid or expired SSO ticket." });
      }

      const gpData = await gpResponse.json() as {
        success: boolean;
        user?: {
          email?: string;
          firstName?: string;
          lastName?: string;
        };
      };

      if (!gpData.success || !gpData.user?.email) {
        return res.status(401).json({ message: "Invalid or expired SSO ticket." });
      }

      const email = gpData.user.email.toLowerCase();

      // Look up the user in our local database; silently create one if absent.
      let user = await storage.getUserByEmail(email);

      if (!user) {
        // SSO users never type this password — it exists only to satisfy the schema.
        const randomHashedPassword = await bcrypt.hash(
          crypto.randomBytes(32).toString("hex"),
          10
        );

        user = await storage.upsertUser({
          email,
          hashedPassword: randomHashedPassword,
          firstName: gpData.user.firstName || null,
          lastName: gpData.user.lastName || null,
        });
      }

      // Establish a local session (strip the hashed password before storing).
      const { hashedPassword, ...userWithoutPassword } = user;
      req.login(userWithoutPassword, (err) => {
        if (err) return next(err);
        res.json({ message: "SSO login successful", user: userWithoutPassword });
      });
    } catch (error) {
      console.error("Error in /api/auth/sso:", error);
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null);
    }
  });

  app.post("/api/tests/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const schema = z.object({
        company: z.string().optional(),
        subject: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]),
        numberOfQuestions: z.number().min(5).max(50),
        context: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const generatedQuestions = await generateMCQTest(data);
      const test = await storage.createTest({
        userId,
        title: `${data.subject} - ${data.difficulty} ${
          data.company ? `(${data.company})` : ""
        }`,
        company: data.company,
        subject: data.subject,
        difficulty: data.difficulty,
        context: data.context,
        totalQuestions: data.numberOfQuestions,
      });

      const questionsData = generatedQuestions.map((q: MCQQuestion) => ({
        testId: test.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        reasoning: q.reasoning,
      }));
      await storage.createQuestions(questionsData);

      const attempt = await storage.createTestAttempt({
        userId,
        testId: test.id,
      });

      res.json({
        testId: test.id,
        attemptId: attempt.id,
        message: "Test generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating test:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to generate test" });
    }
  });

  app.get(
    "/api/attempts/:attemptId",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { attemptId } = req.params;

        const attempt = await storage.getTestAttempt(attemptId);
        if (!attempt) {
          return res.status(404).json({ message: "Test attempt not found" });
        }
        if (attempt.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const test = await storage.getTest(attempt.testId);
        if (!test) {
          return res.status(404).json({ message: "Test not found" });
        }

        const questions = await storage.getQuestionsByTestId(test.id);

        res.json({
          attemptId: attempt.id,
          testTitle: test.title,
          questions,
          startedAt: attempt.startedAt,
        });
      } catch (error) {
        console.error("Error fetching test attempt:", error);
        res.status(500).json({ message: "Failed to fetch test attempt" });
      }
    }
  );

  app.post(
    "/api/attempts/:attemptId/submit",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { attemptId } = req.params;
        const schema = z.object({
          answers: z.array(
            z.object({
              questionId: z.string(),
              selectedAnswer: z.number().min(0).max(3).nullable(),
            })
          ),
          timeTaken: z.number(),
        });
        const { answers, timeTaken } = schema.parse(req.body);

        const attempt = await storage.getTestAttempt(attemptId);
        if (!attempt) {
          return res.status(404).json({ message: "Test attempt not found" });
        }
        if (attempt.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const questions = await storage.getQuestionsByTestId(attempt.testId);
        const questionMap = new Map(questions.map((q) => [q.id, q]));

        let correctCount = 0;
        const userAnswersData = answers.map((answer) => {
          const question = questionMap.get(answer.questionId);
          const isCorrect =
            question && answer.selectedAnswer === question.correctAnswer;
          if (isCorrect) correctCount++;

          return {
            attemptId,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: isCorrect || false,
          };
        });

        await storage.createUserAnswers(userAnswersData); // This uses the variable defined above

        const percentage = Math.round((correctCount / questions.length) * 100);
        const grade =
          percentage >= 90
            ? "A+"
            : percentage >= 85
            ? "A"
            : percentage >= 80
            ? "B+"
            : percentage >= 75
            ? "B"
            : percentage >= 70
            ? "C+"
            : percentage >= 65
            ? "C"
            : percentage >= 60
            ? "D"
            : "F";

        await storage.updateTestAttempt(attemptId, {
          completedAt: new Date(),
          score: correctCount,
          percentage,
          grade,
          timeTaken,
        });

        res.json({
          message: "Test submitted successfully",
          score: correctCount,
          percentage,
          grade,
        });
      } catch (error: any) {
        // This is the typo fix
        console.error("Error submitting test:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to submit test" });
      }
    }
  );

  app.get("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const attempts = await storage.getUserAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch test attempts" });
    }
  });

  app.get(
    "/api/attempts/:attemptId/results",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { attemptId } = req.params;

        const result = await storage.getAttemptWithDetails(attemptId);
        if (!result) {
          return res.status(404).json({ message: "Test results not found" });
        }
        if (result.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }

        res.json(result);
      } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ message: "Failed to fetch test results" });
      }
    }
  );

  app.post(
    "/api/tests/:testId/reattempt",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { testId } = req.params;

        const test = await storage.getTest(testId);
        if (!test) {
          return res.status(404).json({ message: "Test not found" });
        }

        const attempt = await storage.createTestAttempt({
          userId,
          testId: test.id,
        });

        res.json({
          attemptId: attempt.id,
          message: "New attempt created successfully",
        });
      } catch (error: any) {
        console.error("Error creating re-attempt:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to create re-attempt" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
