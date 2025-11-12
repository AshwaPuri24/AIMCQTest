import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMCQTest } from "./openai";
import { z } from "zod";

const MOCK_USER_ID = "local-dev-user-001";
const MOCK_USER = {
  id: MOCK_USER_ID,
  email: "dev@example.com",
  firstName: "Local",
  lastName: "Developer",
  profileImageUrl: "",
  // createdAt: new Date().toISOString(),
  // updatedAt: new Date().toISOString(),
};

export async function registerRoutes(app: Express): Promise<Server> {

  app.get('/api/auth/user', async (req: any, res) => {
    try {

      await storage.upsertUser(MOCK_USER);
      res.json(MOCK_USER);
    } catch (error) {
      console.error("Error fetching/upserting mock user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/tests/generate", async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;

      // Validate request body
      const schema = z.object({
        company: z.string().optional(),
        subject: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]),
        numberOfQuestions: z.number().min(5).max(50),
        context: z.string().optional(),
      });

      const data = schema.parse(req.body);

      // Generate questions using OpenAI
      const generatedQuestions = await generateMCQTest(data);

      // Create test in database
      const test = await storage.createTest({
        userId, // Uses MOCK_USER_ID
        title: `${data.subject} - ${data.difficulty} ${data.company ? `(${data.company})` : ""}`,
        company: data.company,
        subject: data.subject,
        difficulty: data.difficulty,
        context: data.context,
        totalQuestions: data.numberOfQuestions,
      });

      // Create questions
      const questionsData = generatedQuestions.map((q) => ({
        testId: test.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        reasoning: q.reasoning,
      }));

      await storage.createQuestions(questionsData);

      // Create test attempt
      const attempt = await storage.createTestAttempt({
        userId, // Uses MOCK_USER_ID
        testId: test.id,
      });

      res.json({
        testId: test.id,
        attemptId: attempt.id,
        message: "Test generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating test:", error);
      res.status(500).json({ message: error.message || "Failed to generate test" });
    }
  });

  // Create a new attempt for an existing test (Re-attempt)
  app.post("/api/tests/:testId/reattempt", async (req: any, res) => {
    try {
      const userId = MOCK_USER_ID;
      const { testId } = req.params;

      // 1. Verify the test exists
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // 2. Create a new test attempt
      const attempt = await storage.createTestAttempt({
        userId,
        testId: test.id,
      });

      // 3. Return the new attempt ID
      res.json({
        attemptId: attempt.id,
        message: "New attempt created successfully",
      });

    } catch (error: any) {
      console.error("Error creating re-attempt:", error);
      res.status(500).json({ message: error.message || "Failed to create re-attempt" });
    }
  });
  
  // Get test attempt with questions
  app.get("/api/attempts/:attemptId", /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub; // OLD
      const userId = MOCK_USER_ID; // NEW
      const { attemptId } = req.params;

      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      // Verify ownership (this check still works, but with the mock user)
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
  });

  // Submit test answers
  app.post("/api/attempts/:attemptId/submit", /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub; // OLD
      const userId = MOCK_USER_ID; // NEW
      const { attemptId } = req.params;

      const schema = z.object({
        answers: z.array(z.object({
          questionId: z.string(),
          selectedAnswer: z.number().min(0).max(3).nullable(),
        })),
        timeTaken: z.number(),
      });

      const { answers, timeTaken } = schema.parse(req.body);

      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      // Verify ownership
      if (attempt.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get all questions for the test
      const questions = await storage.getQuestionsByTestId(attempt.testId);
      const questionMap = new Map(questions.map(q => [q.id, q]));

      // Calculate score and create user answers
      let correctCount = 0;
      const userAnswersData = answers.map((answer) => {
        const question = questionMap.get(answer.questionId);
        const isCorrect = question && answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        return {
          attemptId,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: isCorrect || false,
        };
      });

      await storage.createUserAnswers(userAnswersData);

      // Calculate percentage and grade
      const percentage = Math.round((correctCount / questions.length) * 100);
      const grade = 
        percentage >= 90 ? "A+" :
        percentage >= 85 ? "A" :
        percentage >= 80 ? "B+" :
        percentage >= 75 ? "B" :
        percentage >= 70 ? "C+" :
        percentage >= 65 ? "C" :
        percentage >= 60 ? "D" : "F";

      // Update test attempt
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
      console.error("Error submitting test:", error);
      res.status(500).json({ message: error.message || "Failed to submit test" });
    }
  });

  // Get user's test attempts
  app.get("/api/attempts", /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub; // OLD
      const userId = MOCK_USER_ID; // NEW
      const attempts = await storage.getUserAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch test attempts" });
    }
  });

  // Get test results with details
  app.get("/api/attempts/:attemptId/results", /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub; // OLD
      const userId = MOCK_USER_ID; // NEW
      const { attemptId } = req.params;

      const result = await storage.getAttemptWithDetails(attemptId);
      if (!result) {
        return res.status(404).json({ message: "Test results not found" });
      }

      // Verify ownership
      if (result.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}