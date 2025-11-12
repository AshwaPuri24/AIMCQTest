import {
  users,
  tests,
  questions,
  testAttempts,
  userAnswers,
  type User,
  type UpsertUser,
  type Test,
  type InsertTest,
  type Question,
  type InsertQuestion,
  type TestAttempt,
  type InsertTestAttempt,
  type UserAnswer,
  type InsertUserAnswer,
  type TestWithQuestions,
  type AttemptWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Test operations
  createTest(test: InsertTest): Promise<Test>;
  getTest(id: string): Promise<Test | undefined>;
  getTestWithQuestions(id: string): Promise<TestWithQuestions | undefined>;
  getUserTests(userId: string): Promise<Test[]>;

  // Question operations
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  getQuestionsByTestId(testId: string): Promise<Question[]>;

  // Test attempt operations
  createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt>;
  getTestAttempt(id: string): Promise<TestAttempt | undefined>;
  updateTestAttempt(
    id: string,
    data: Partial<TestAttempt>
  ): Promise<TestAttempt>;
  getUserAttempts(userId: string): Promise<(TestAttempt & { test: Test })[]>;
  getAttemptWithDetails(id: string): Promise<AttemptWithDetails | undefined>;

  // User answer operations
  createUserAnswers(answers: InsertUserAnswer[]): Promise<UserAnswer[]>;
  getUserAnswersByAttempt(attemptId: string): Promise<UserAnswer[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { id, ...updateData } = userData;
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...updateData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Test operations
  async createTest(testData: InsertTest): Promise<Test> {
    const [test] = await db.insert(tests).values(testData).returning();
    return test;
  }

  async getTest(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async getTestWithQuestions(
    id: string
  ): Promise<TestWithQuestions | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    if (!test) return undefined;

    const questionsList = await db
      .select()
      .from(questions)
      .where(eq(questions.testId, id))
      .orderBy(questions.questionNumber);

    return {
      ...test,
      questions: questionsList,
    };
  }

  async getUserTests(userId: string): Promise<Test[]> {
    return await db
      .select()
      .from(tests)
      .where(eq(tests.userId, userId))
      .orderBy(desc(tests.createdAt));
  }

  // Question operations
  async createQuestions(questionsData: InsertQuestion[]): Promise<Question[]> {
    if (questionsData.length === 0) return [];
    return await db.insert(questions).values(questionsData).returning();
  }

  async getQuestionsByTestId(testId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.testId, testId))
      .orderBy(questions.questionNumber);
  }

  // Test attempt operations
  async createTestAttempt(
    attemptData: InsertTestAttempt
  ): Promise<TestAttempt> {
    const [attempt] = await db
      .insert(testAttempts)
      .values(attemptData)
      .returning();
    return attempt;
  }

  async getTestAttempt(id: string): Promise<TestAttempt | undefined> {
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.id, id));
    return attempt;
  }

  async updateTestAttempt(
    id: string,
    data: Partial<TestAttempt>
  ): Promise<TestAttempt> {
    const [attempt] = await db
      .update(testAttempts)
      .set(data)
      .where(eq(testAttempts.id, id))
      .returning();
    return attempt;
  }

  async getUserAttempts(
    userId: string
  ): Promise<(TestAttempt & { test: Test })[]> {
    const attempts = await db
      .select({
        attempt: testAttempts,
        test: tests,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .where(eq(testAttempts.userId, userId))
      .orderBy(desc(testAttempts.startedAt));

    return attempts.map((row) => ({
      ...row.attempt,
      test: row.test,
    }));
  }

  async getAttemptWithDetails(
    id: string
  ): Promise<AttemptWithDetails | undefined> {
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.id, id));

    if (!attempt) return undefined;

    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, attempt.testId));

    if (!test) return undefined;

    const answers = await db
      .select({
        answer: userAnswers,
        question: questions,
      })
      .from(userAnswers)
      .innerJoin(questions, eq(userAnswers.questionId, questions.id))
      .where(eq(userAnswers.attemptId, id))
      .orderBy(questions.questionNumber);

    return {
      ...attempt,
      test,
      userAnswers: answers.map((row) => ({
        ...row.answer,
        question: row.question,
      })),
    };
  }

  // User answer operations
  async createUserAnswers(
    answersData: InsertUserAnswer[]
  ): Promise<UserAnswer[]> {
    if (answersData.length === 0) return [];
    return await db.insert(userAnswers).values(answersData).returning();
  }

  async getUserAnswersByAttempt(attemptId: string): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.attemptId, attemptId));
  }
}

export const storage = new DatabaseStorage();

//
