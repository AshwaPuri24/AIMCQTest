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

const SYSTEM_PROMPT =
  "You are an expert technical interviewer. Output ONLY valid JSON in the exact shape the user requests — never prose, never markdown, never code fences.";

const SYSTEM_PROMPT_STRICT =
  "Output ONLY a single JSON object. Start with { and end with }. No prose. No code fences. No commentary.";

function buildPrompt(request: GenerateTestRequest): string {
  return `Generate ${request.numberOfQuestions} multiple-choice technical questions.

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
      "reasoning": "<<<one short sentence>>>"
    }
  ]
}

Rules (follow strictly):
- Exactly ${request.numberOfQuestions} items in "questions".
- Each "options" array MUST have exactly 4 short strings (max 12 words each).
- "correctAnswer" MUST be an integer: 0, 1, 2, or 3 (index of the correct option).
- "reasoning" MUST be ONE sentence, max 20 words. NO multi-sentence explanations.
- "questionNumber" starts at 1, increments by 1.
- Output ONLY the JSON object. No prose. No markdown fences. No commentary.`;
}

function stripCodeFences(s: string): string {
  // Some models wrap JSON in ```json ... ``` despite being told not to.
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

function parseAndValidate(content: string): MCQQuestion[] {
  let parsed: any;
  try {
    parsed = JSON.parse(stripCodeFences(content));
  } catch {
    console.error("Model returned non-JSON. First 500 chars:", content.slice(0, 500));
    throw new Error("Model output was not valid JSON");
  }

  const raw: any[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.questions) ? parsed.questions
    : Array.isArray(parsed.mcqs)      ? parsed.mcqs
    : Array.isArray(parsed.data)      ? parsed.data
    : [];

  if (raw.length === 0) {
    throw new Error("Model produced zero questions");
  }

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
}

async function callModel(systemPrompt: string, userPrompt: string) {
  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "qwen2.5-mcq",
    temperature: 0.3,
    max_tokens: 6000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
}

export async function generateMCQTest(
  request: GenerateTestRequest,
): Promise<MCQQuestion[]> {
  const userPrompt = buildPrompt(request);

  // First attempt
  try {
    const response = await callModel(SYSTEM_PROMPT, userPrompt);
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty model response");
    return parseAndValidate(content);
  } catch (firstErr: any) {
    console.warn("First generation attempt failed, retrying with stricter prompt:", firstErr.message);
  }

  // Retry once with stricter system prompt
  try {
    const response = await callModel(SYSTEM_PROMPT_STRICT, userPrompt);
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty model response on retry");
    return parseAndValidate(content);
  } catch (retryErr: any) {
    console.error("MCQ generation failed after retry:", retryErr);
    throw new Error("Test generation failed");
  }
}
const BATCH_SIZE = 8;  // questions per LLM call; tuned for ~30s response time

/**
 * Generates a large test by issuing multiple smaller LLM calls in sequence,
 * then concatenating. Each batch fits comfortably under Cloudflare's
 * 100s-idle timeout. The routes layer is responsible for keeping the HTTP
 * response alive with heartbeats while this runs.
 */
export async function generateMCQTestBatched(
  request: GenerateTestRequest,
  onProgress?: (count: number) => void,
): Promise<MCQQuestion[]> {
  if (request.numberOfQuestions <= BATCH_SIZE) {
    return generateMCQTest(request);
  }

  const all: MCQQuestion[] = [];
  let remaining = request.numberOfQuestions;

  while (remaining > 0) {
    const thisBatch = Math.min(BATCH_SIZE, remaining);
    const batch = await generateMCQTest({
      ...request,
      numberOfQuestions: thisBatch,
    });

    batch.forEach((q, i) => {
      q.questionNumber = all.length + i + 1;
    });
    all.push(...batch);

    remaining = request.numberOfQuestions - all.length;
    console.log(`[batch] ${all.length}/${request.numberOfQuestions} questions generated`);
    onProgress?.(all.length);
  }

  return all;
}
