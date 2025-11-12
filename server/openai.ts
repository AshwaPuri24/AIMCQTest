
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MCQQuestion {
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
  reasoning: string;
}

export interface GenerateTestRequest {
  company?: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  context?: string;
}

export async function generateMCQTest(request: GenerateTestRequest): Promise<MCQQuestion[]> {
  const prompt = `Generate ${request.numberOfQuestions} multiple-choice technical questions for the following:
${request.company ? `Company/Exam: ${request.company}` : ""}
Subject: ${request.subject}
Difficulty: ${request.difficulty}
${request.context ? `Additional Context: ${request.context}` : ""}

Requirements:
1. Create high-quality technical MCQs suitable for interview preparation
2. Each question should have exactly 4 options
3. Mark the correct answer (0-3 index)
4. Provide detailed reasoning explaining why the correct answer is right
5. Make questions progressively challenging for ${request.difficulty} level
6. Focus on practical, real-world scenarios when possible

Return ONLY a JSON array in this exact format:
[
  {
    "questionNumber": 1,
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "reasoning": "Detailed explanation of why this answer is correct..."
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and educator. Generate high-quality, accurate technical MCQs with detailed explanations. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the response - it might be wrapped in an object
    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate each question
    questions.forEach((q: any, idx: number) => {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question format at index ${idx}`);
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correct answer at index ${idx}`);
      }
    });

    return questions as MCQQuestion[];
  } catch (error: any) {
    console.error("OpenAI generation error:", error);
    throw new Error(`Failed to generate test: ${error.message}`);
  }
}
