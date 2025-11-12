import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMCQTest, type MCQQuestion } from "./openai";
import { z } from "zod";
import { isAuthenticated } from "./auth"; // Our new middleware
import { InsertUserAnswer } from "@shared/schema";
import passport from "passport";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // --- NEW AUTHENTICATION ROUTES ---
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
        id: undefined,
        email: email.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
      });

      // Log the user in immediately after registration
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

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) {
        return next(err);
      }
      // Only destroy session if it exists
      const session = (req as any).session;
      if (session && typeof session.destroy === "function") {
        session.destroy((destroyErr: any) => {
          if (destroyErr) {
            return next(destroyErr);
          }
          res.clearCookie("connect.sid"); // Clear the session cookie
          res.json({ message: "Logged out successfully" });
        });
      } else {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      }
    });
  });

  // Get current user
  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null); // Return null if not authenticated
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
        options: Array.isArray(q.options)
          ? q.options.map(String)
          : Array.from(q.options, String),
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
        if (attempt.completedAt) {
          return res.status(400).json({ message: "Test already submitted" });
        }

        const questions = await storage.getQuestionsByTestId(attempt.testId);
        const questionMap = new Map(questions.map((q) => [q.id, q]));
        let correctCount = 0;
        const userAnswersData: InsertUserAnswer[] = answers.map((answer) => {
          const question = questionMap.get(answer.questionId);
          let isCorrect = false;

          if (question && answer.selectedAnswer !== null) {
            isCorrect = question.correctAnswer === answer.selectedAnswer;
            if (isCorrect) {
              correctCount++;
            }
          }

          return {
            attemptId,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
          };
        });

        await storage.createUserAnswers(userAnswersData);

        // Calculate percentage and grade
        const totalQuestions = questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);

        let grade = "F";
        if (percentage >= 90) grade = "A";
        else if (percentage >= 80) grade = "B";
        else if (percentage >= 70) grade = "C";
        else if (percentage >= 60) grade = "D";

        await storage.updateTestAttempt(attemptId, {
          completedAt: new Date(),
          score: correctCount,
          percentage,
          grade,
          timeTaken,
        });

        res.json({
          message: "Test submitted successfully",
          attemptId,
          score: correctCount,
          percentage,
          grade,
        });
      } catch (error: any) {
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
        // Note: We don't check test.userId === userId, allowing users to re-attempt a test
        // even if the original test was somehow created by another user (e.g., public tests later)

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
