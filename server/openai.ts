import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "ollama",
  baseURL: process.env.OPENAI_BASE_URL,
});

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

export async function generateMCQTest(
  request: GenerateTestRequest,
): Promise<MCQQuestion[]> {
  const prompt = `Generate ${request.numberOfQuestions} multiple-choice technical questions.

${request.company ? `Company/Exam: ${request.company}` : ""}
Subject: ${request.subject}
Difficulty: ${request.difficulty}
${request.context ? `Additional Context: ${request.context}` : ""}

Output a single JSON object with EXACTLY this shape — note this is just a SHAPE EXAMPLE about an unrelated topic; you must NOT include this example in your output:

{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "<<<example only — replace with a real question on the requested subject>>>",
      "options": [
        "<<<option A text>>>",
        "<<<option B text>>>",
        "<<<option C text>>>",
        "<<<option D text>>>"
      ],
      "correctAnswer": 0,
      "reasoning": "<<<one or two sentence explanation>>>"
    }
  ]
}

Rules (follow strictly):
- Exactly ${request.numberOfQuestions} items in "questions".
- Each "options" array MUST have exactly 4 string entries.
- "correctAnswer" MUST be an integer: 0, 1, 2, or 3 (index of the correct option).
- "reasoning" MUST be one or two sentences explaining the correct answer.
- "questionNumber" starts at 1, increments by 1.
- Output ONLY the JSON object. No prose. No markdown fences. No commentary.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "llama3.2:3b",
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Output ONLY valid JSON in the exact shape the user requests — never prose, never markdown.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from model");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Model returned non-JSON. First 500 chars:", content.slice(0, 500));
      throw new Error("Model output was not valid JSON");
    }

    // The model may return one of several shapes; accept any.
    const raw: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.questions) ? parsed.questions
      : Array.isArray(parsed.mcqs)      ? parsed.mcqs
      : Array.isArray(parsed.data)      ? parsed.data
      : [];

    if (raw.length === 0) {
      throw new Error("Model produced zero questions");
    }

    // Lenient: skip malformed entries instead of failing the whole batch.
    const valid: MCQQuestion[] = [];
    for (let i = 0; i < raw.length; i++) {
      const q = raw[i];
      const ok =
        typeof q?.questionText === "string" &&
        Array.isArray(q?.options) &&
        q.options.length === 4 &&
        q.options.every((o: any) => typeof o === "string") &&
        typeof q?.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        typeof q?.reasoning === "string";

      if (ok) {
        valid.push({
          questionNumber: valid.length + 1,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          reasoning: q.reasoning,
        });
      } else {
        console.warn(`Skipping malformed question at index ${i}:`, JSON.stringify(q).slice(0, 200));
      }
    }

    if (valid.length === 0) {
      throw new Error("No valid questions in model output");
    }

    return valid;
  } catch (error: any) {
    console.error("MCQ generation error:", error);
    // Generic message bubbles up to client; full error stays in server logs (security)
    throw new Error("Test generation failed");
  }
}
