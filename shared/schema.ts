import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tests table - stores generated tests
export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  company: text("company"),
  subject: text("subject").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // easy, medium, hard
  context: text("context"),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table - stores individual questions for each test
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(), // 0-3 index
  reasoning: text("reasoning").notNull(),
});

// Test attempts table - tracks when users take tests
export const testAttempts = pgTable("test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  testId: varchar("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  percentage: integer("percentage"),
  grade: varchar("grade", { length: 2 }),
  timeTaken: integer("time_taken"), // in seconds
});

// User answers table - stores answers for each question in an attempt
export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  selectedAnswer: integer("selected_answer"), // 0-3 index, null if not answered
  isCorrect: boolean("is_correct"),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  tests: many(tests),
  testAttempts: many(testAttempts),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
  user: one(users, {
    fields: [tests.userId],
    references: [users.id],
  }),
  questions: many(questions),
  attempts: many(testAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
  userAnswers: many(userAnswers),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [testAttempts.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testAttempts.testId],
    references: [tests.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [userAnswers.attemptId],
    references: [testAttempts.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
}));

// Zod schemas for validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
}).extend({
  numberOfQuestions: z.number().min(5).max(50),
});

export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  score: true,
  percentage: true,
  grade: true,
  timeTaken: true,
});

export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
export type TestAttempt = typeof testAttempts.$inferSelect;

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  isCorrect: true,
});

export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;

// Additional types for API responses
export type TestWithQuestions = Test & {
  questions: Question[];
};

export type AttemptWithDetails = TestAttempt & {
  test: Test;
  userAnswers: (UserAnswer & {
    question: Question;
  })[];
};
