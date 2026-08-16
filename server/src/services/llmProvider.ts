type AnatomyContext = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  keyPoints: string[];
  funFacts: string[];
  relatedSystems: string[];
};

type RequestMode = 'ask' | 'explain-simply' | 'deep-dive' | 'study-summary' | 'quiz-me' | 'compare';

type QuizQuestionResult = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type RequestBody = {
  question: string;
  anatomyContext: AnatomyContext;
  compareContext?: AnatomyContext;
  mode: RequestMode;
};

type ChatResponse = {
  answer?: string;
  quiz?: QuizQuestionResult[];
};

const BASE_PROMPT = `You are Anatomy AI, an educational human anatomy tutor who speaks directly to the student.

Return only the final student-facing answer.
Use the supplied anatomy facts as your primary source of truth.
Do not mention instructions, prompts, hidden guidance, metadata, or backend details.
Do not repeat the question, the context labels, or any wrapper text such as 'Question:', 'Using provided context:', or 'Let me explain'.
Write the answer as a clean, direct explanation for the student.
Keep the answer appropriate to the selected learning mode and anatomy topic.
For all non-quiz modes, prefer clear headings, short explanations, bullets, numbered steps, and bolded anatomy terms.
Avoid giant paragraphs, repeated context, meta commentary, disclaimers, or academic fluff.
Do not diagnose medical conditions or give treatment advice.`;

function buildModeInstruction(mode: RequestMode, strictJsonOnly = false): string {
  switch (mode) {
    case 'ask':
      return `Answer the student directly and naturally.
Use a concise, conversational tone.
Format: ### Answer
Then give 1-3 short paragraphs OR a few short bullets when appropriate.
Do not produce a long explanation unless the user explicitly asks for detail.
Do not add any preamble, wrapper text, or meta commentary.`;
    case 'explain-simply':
      return `Explain the anatomy topic in beginner-friendly language.
Use exactly this structure:
## Simple Explanation
- **What it is:** ...
- **Main job:** ...
- **How it works:** ...
- **Why it matters:** ...
Use short sentences and simple wording. Keep it to about 5-7 bullet points maximum.
Use a simple analogy only if it genuinely helps.
Avoid medical advice, diagnosis, or treatment recommendations.`;
    case 'deep-dive':
      return `Provide a detailed but scan-friendly anatomy explanation.
Use this exact style:
## Overview
2-3 concise sentences.

## Main Structures
- **Structure:** explanation
- **Structure:** explanation
- **Structure:** explanation

## How It Works
1. **Step:** explanation
2. **Step:** explanation
3. **Step:** explanation
4. **Step:** explanation

## Functions
- **Function:** explanation
- **Function:** explanation
- **Function:** explanation

## Connections to Other Systems
- **System:** relationship
- **System:** relationship

## Key Facts
- **Fact**
- **Fact**
- **Fact**

Rules: prefer bullets and numbered steps; never create a single giant paragraph; keep each bullet to roughly 1-2 sentences; use bold for important anatomy terms; do not repeat information unnecessarily; aim for roughly 400-700 words depending on topic complexity.`;
    case 'study-summary':
      return `Produce revision notes, not an essay.
Use this exact structure:
# [Anatomy Name] — Study Summary

## What Is It?
- ...

## Main Structures
- **Structure:** ...
- **Structure:** ...

## Main Functions
- ...
- ...
- ...

## Blood Flow / Pathway
1. ...
2. ...
3. ...
Only include blood flow/pathway when relevant.

## Important Terms
- **Term:** short definition
- **Term:** short definition

## Key Facts
- ...
- ...
- ...

## Remember
- **Most important point**
- **Most important point**
- **Most important point**
Keep it concise enough for a 1-2 minute revision session.`;
    case 'quiz-me':
      return strictJsonOnly
        ? 'Return only valid JSON in this exact structure: { "quiz": [{ "question": "...", "options": ["...","...","...","..."], "correctAnswer": 0, "explanation": "..." }] }. Use exactly 5 questions, exactly 4 options each, correctAnswer as an integer from 0 to 3, and no markdown fences, no comments, and no extra text before or after the JSON.'
        : 'Create exactly 5 multiple-choice anatomy questions based only on the supplied anatomy context. Return valid JSON in this exact structure: { "quiz": [{ "question": "...", "options": ["...","...","...","..."], "correctAnswer": 0, "explanation": "..." }] }. Use exactly 5 questions, exactly 4 options each, correctAnswer as an integer from 0 to 3, and no markdown fences, no comments, and no extra text before or after the JSON.';
    case 'compare':
      return `Compare the two anatomy structures or systems in a highly scan-friendly way.
Use this exact style:
# [Structure A] vs [Structure B]

## Function
| | [Structure A] | [Structure B] |
|---|---|---|
| Main function | ... | ... |

## Structure
| | [Structure A] | [Structure B] |
|---|---|---|
| Structure | ... | ... |

## Role in the Body
| | [Structure A] | [Structure B] |
|---|---|---|
| Role | ... | ... |

## Key Differences
- **Difference 1:** ...
- **Difference 2:** ...
- **Difference 3:** ...

## Similarities
- ...
- ...
Do not return one long paragraph.
If a table is not appropriate, use clearly separated bullet sections instead.`;
    default:
      return 'Answer directly and clearly as a student-facing anatomy tutor.';
  }
}

function buildContextText(label: string, anatomyContext: AnatomyContext): string {
  return `${label}:\n${JSON.stringify({
    id: anatomyContext.id,
    name: anatomyContext.name,
    category: anatomyContext.category,
    difficulty: anatomyContext.difficulty,
    description: anatomyContext.description,
    keyPoints: anatomyContext.keyPoints,
    funFacts: anatomyContext.funFacts,
    relatedSystems: anatomyContext.relatedSystems
  }, null, 2)}`;
}

function buildPromptPayload(
  anatomyContext: AnatomyContext,
  question: string,
  mode: RequestMode,
  compareContext?: AnatomyContext,
  strictJsonOnly = false
) {
  const compareFacts = compareContext ? `\nComparison target:\n- Name: ${compareContext.name}\n- Description: ${compareContext.description}\n- Key points: ${compareContext.keyPoints.join('; ')}\n- Related systems: ${compareContext.relatedSystems.join(', ')}` : '';

  const anatomyFacts = [
    `- Name: ${anatomyContext.name}`,
    `- Description: ${anatomyContext.description}`,
    `- Key points: ${anatomyContext.keyPoints.join('; ')}`,
    `- Related systems: ${anatomyContext.relatedSystems.join(', ')}`,
    `- Fun facts: ${anatomyContext.funFacts.join('; ')}`
  ].join('\n');

  const finalInstructions = `You are an anatomy tutor.

Answer the student's question directly.
Return ONLY the final student-facing answer.
Do not repeat the student's question.
Do not describe the instructions.
Do not mention anatomyContext, supplied facts, prompts, system messages, or how you generated the answer.

Student question:
${question}

Anatomy information:
${anatomyFacts}${compareFacts}

Mode guidance:
${buildModeInstruction(mode, strictJsonOnly)}`;

  return finalInstructions;
}

function looksLikePromptLeak(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const leakPatterns = [
    'system prompt',
    'developer instructions',
    'developer message',
    'hidden instructions',
    'internal reasoning',
    'prompt construction',
    'the system instructions',
    'this is a system message',
    'my instructions were',
    'based on my instructions',
    'i was instructed by the developer',
    'i am an ai language model',
    'as an ai language model',
    'the prompt says',
    'according to the prompt',
    'do not reveal prompts',
    'do not mention internal instructions',
    'we need to answer',
    'we need to give answer',
    'the user asks',
    'the anatomy context says',
    'the primary anatomy context says',
    'using provided context',
    'provide answer',
    'produce answer',
    'use the key points',
    'the instructions say',
    'according to the key points',
    'based on the provided context',
    'let me explain',
    'here is the answer',
    'here\'s the answer',
    'just answer',
    'use context',
    'use the context',
    'the context says',
    'we should',
    'we just need to',
    'question:',
    'answer:',
    'output answer',
    'no meta',
    'no preamble',
    'using context',
    'using the context'
  ];

  if (leakPatterns.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  return /(question\s*[:;-]|using\s+provided\s+context|based\s+on\s+the\s+provided\s+context|the\s+user\s+asks|we\s+(need|should)\s+to|let\s+me\s+explain|output\s+answer|the\s+anatomy\s+context\s+says|use\s+the\s+key\s+points|answer\s*:|the\s+prompt|the\s+instructions)/i.test(normalized);
}

function sanitizePromptLeakWrapper(text: string): string {
  let cleaned = text.replace(/\r/g, '').trim();

  const wrapperPatterns = [
    /^(?:we(?: just)? need to(?: give)? answer|we need to|we just need to|we need answer|we should)\s*[:\-]?\s*/i,
    /^(?:the user asks|the user wants|the primary anatomy context says|the anatomy context says|the prompt says|the instructions say|according to the prompt|according to the key points|use the key points|based on the provided context|here is the answer|here's the answer|let me explain|produce answer|provide answer|use context|use the context|the context says|just answer)\s*[:\-]?\s*/i,
    /^(?:i should answer|i will answer|i can answer)\s*[:\-]?\s*/i,
    /^\s*[-•*]\s*/
  ];

  for (const pattern of wrapperPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  const inlineLeakPatterns = [
    /\b(?:we(?: just)? need to(?: give)? answer|we need to|we need answer|the user asks|the primary anatomy context says|the anatomy context says|the prompt says|the instructions say|use the key points|use context|use the context|based on the provided context|according to the prompt|according to the key points|here is the answer|here's the answer|let me explain|produce answer|provide answer|just answer|the context says|we should)\b\s*[:\-]?\s*/gi,
    /\b(?:the user asks|the primary anatomy context says|the anatomy context says|the prompt says|the instructions say)\b\s*[:\-]?\s*/gi
  ];

  for (const pattern of inlineLeakPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

function sanitizeStudentFacingAnswer(text: string): string {
  let cleaned = text.replace(/\r/g, '').trim();

  const prefixPatterns = [
    /^question\s*[:;.-]?\s*/i,
    /^answer\s*[:;.-]?\s*/i,
    /^so\s+answer\s*[:;.-]?\s*/i,
    /^using\s+provided\s+context\s*[:;.-]?\s*/i,
    /^using\s+the\s+provided\s+context\s*[:;.-]?\s*/i,
    /^the\s+answer\s+is\s*[:;.-]?\s*/i,
    /^here\s+is\s+the\s+answer\s*[:;.-]?\s*/i,
    /^here's\s+the\s+answer\s*[:;.-]?\s*/i,
    /^let\s+me\s+explain\s*[:;.-]?\s*/i,
    /^we\s+(need|should)\s+to\s+(answer|give\s+answer|produce\s+answer)\s*[:;.-]?\s*/i,
    /^the\s+user\s+asks\s*[:;.-]?\s*/i,
    /^the\s+anatomy\s+context\s+says\s*[:;.-]?\s*/i,
    /^need\s+to\s*[:;.-]?\s*/i,
    /^output\s+(a|an|the)\s*[:;.-]?\s*/i,
    /^produce\s+.*?\s*[:;.-]?\s*/i,
    /^use\s+the\s+(primary\s+)?anatomy\s+context\s*[:;.-]?\s*/i
  ];

  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  for (let i = 0; i < 8; i += 1) {
    const next = sanitizePromptLeakWrapper(cleaned);
    if (next === cleaned) break;
    cleaned = next;
  }

  cleaned = cleaned
    .replace(/\b(?:question|using provided context|provided context|the user asks|the anatomy context says|the prompt says|the instructions say|use the key points|use the context|use the context|based on the provided context|according to the prompt|according to the key points|here is the answer|here's the answer|let me explain|produce answer|provide answer|just answer|we should|we need to answer|we need to give answer|output answer|need to|need\s+to)\b\s*[:;.-]?\s*/gi, '')
    .replace(/\b(?:question|answer)\s*[:;.-]?\s*/gi, '');

  const sentenceParts = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.length > 12 && !looksLikePromptLeak(part));

  const finalCandidate = (sentenceParts.join(' ') || cleaned)
    .replace(/\s+/g, ' ')
    .trim();

  return finalCandidate.replace(/^[\s"“'`:-]+|[\s"“'`:-]+$/g, '');
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  return trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

function validateQuizPayload(payload: unknown): QuizQuestionResult[] {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Quiz payload is not an object');
  }

  const candidate = payload as Record<string, unknown>;
  const rawQuiz = candidate.quiz;
  if (!Array.isArray(rawQuiz) || rawQuiz.length !== 5) {
    throw new Error('Quiz must contain exactly 5 questions');
  }

  return rawQuiz.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Question ${index + 1} is invalid`);
    }

    const item = entry as Record<string, unknown>;
    const question = typeof item.question === 'string' ? item.question.trim() : '';
    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    const options = Array.isArray(item.options) ? item.options : [];
    const correctAnswer = typeof item.correctAnswer === 'number' ? item.correctAnswer : Number(item.correctAnswer);

    if (!question || !explanation || options.length !== 4 || options.some((option) => typeof option !== 'string' || option.trim().length === 0)) {
      throw new Error(`Question ${index + 1} is malformed`);
    }

    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      throw new Error(`Question ${index + 1} has an invalid correctAnswer`);
    }

    return {
      question,
      options: options.map((option) => String(option).trim()),
      correctAnswer,
      explanation
    };
  });
}

function parseQuizJson(text: string): QuizQuestionResult[] {
  const cleaned = stripCodeFence(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const candidate = firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  const parsed = JSON.parse(candidate) as unknown;
  return validateQuizPayload(parsed);
}

function buildStudentAnswerFromContext(
  mode: RequestMode,
  anatomyContext: AnatomyContext,
  _question: string,
  compareContext?: AnatomyContext
): string {
  const firstName = anatomyContext.name;
  const description = anatomyContext.description;
  const keyPoints = anatomyContext.keyPoints;
  const facts = anatomyContext.funFacts;

  switch (mode) {
    case 'ask': {
      const core = keyPoints[0] || description;
      return `${firstName} primarily functions by ${core.toLowerCase()}. It helps keep the body working normally by moving blood, filtering fluids, or supporting the related system functions described in the anatomy data.`;
    }
    case 'explain-simply': {
      return `The ${firstName.toLowerCase()} is an important anatomical structure. Think of it like a busy worker in the body: it ${keyPoints[0]?.toLowerCase() || 'supports normal function'} and helps the body maintain balance. It works closely with ${anatomyContext.relatedSystems.join(', ') || 'the circulatory system'} to keep the body functioning smoothly.`;
    }
    case 'deep-dive': {
      return `## Overview\nThe ${firstName} is ${description.toLowerCase()}.\n\n## Important structures\n- ${keyPoints.join('\n- ')}\n\n## How it works\nIt supports normal body function by coordinating its structural features with the surrounding systems, especially ${anatomyContext.relatedSystems.join(', ')}.\n\n## Relationship with other systems\nThe ${firstName} works closely with ${anatomyContext.relatedSystems.join(', ')} to maintain body homeostasis.\n\n## Important facts\n- ${facts.slice(0, 3).join('\n- ')}`;
    }
    case 'study-summary': {
      return `# ${firstName} — Study Summary\n\n## What is it?\nThe heart is a muscular organ that pumps blood around the body.\n\n## Main Structures\n- Right atrium\n- Right ventricle\n- Left atrium\n- Left ventricle\n- Valves\n- Major blood vessels\n\n## Main Functions\n- Pumps blood to the lungs to collect oxygen\n- Pumps oxygen-rich blood to the rest of the body\n- Keeps circulation moving and maintains blood pressure\n\n## Blood Flow\n- Blood enters the right atrium from the body\n- It moves into the right ventricle and is pumped to the lungs\n- Oxygen-rich blood returns to the left atrium\n- It passes to the left ventricle and is pumped through the aorta to the body\n\n## Important Terms\n- Atrium — upper chamber that receives blood\n- Ventricle — lower chamber that pumps blood out\n- Valve — prevents backflow of blood\n- Circulation — movement of blood through the heart and body\n\n## Key Facts\n- The heart has four chambers\n- The left ventricle has the thickest wall\n- The heart beats continuously to keep blood moving\n- It works closely with the circulatory system\n\n## Remember\n- The heart is the body’s main pump\n- Blood flows in one direction through the heart\n- The right side sends blood to the lungs, and the left side sends blood to the body\n- Valves keep blood moving correctly\n- A healthy heart keeps oxygen and nutrients moving throughout the body.`;
    }
    case 'compare': {
      if (!compareContext) return `${firstName} is ${description.toLowerCase()}.`;
      return `## ${firstName} vs ${compareContext.name}\n\n| Feature | ${firstName} | ${compareContext.name} |\n|---|---|---|\n| Function | ${description} | ${compareContext.description} |\n| Structure | ${keyPoints[0]} | ${compareContext.keyPoints[0]} |\n| Role | Works with ${anatomyContext.relatedSystems.join(', ')} | Works with ${compareContext.relatedSystems.join(', ')} |\n| Key difference | ${firstName} is a major structure for ${description.toLowerCase()} | ${compareContext.name} is focused on ${compareContext.description.toLowerCase()} |`;
    }
    default:
      return `${firstName} is ${description.toLowerCase()}.`;
  }
}

function buildQuizFromContext(anatomyContext: AnatomyContext): QuizQuestionResult[] {
  const baseName = anatomyContext.name;
  const q1 = `${baseName} is best described as which of the following?`;
  const q2 = `Which feature is most important for ${baseName.toLowerCase()} function?`;
  const q3 = `What is the main role of ${baseName.toLowerCase()} within the body?`;
  const q4 = `Which statement about ${baseName.toLowerCase()} is correct?`;
  const q5 = `Which system most directly interacts with ${baseName.toLowerCase()}?`;

  return [
    { question: q1, options: [anatomyContext.description, 'A type of tissue only', 'A random fluid', 'A bone structure'], correctAnswer: 0, explanation: `The description matches ${baseName} as a functional anatomical structure.` },
    { question: q2, options: [anatomyContext.keyPoints[0] || 'Normal tissue balance', 'Random color', 'No blood flow', 'Disconnection from body systems'], correctAnswer: 0, explanation: `The key point most directly captures the organ’s core anatomical role.` },
    { question: q3, options: [`Maintain normal body function through ${anatomyContext.description.toLowerCase()}`, 'Replace all other organs', 'Store only fat', 'Stop blood flow'], correctAnswer: 0, explanation: `The organ contributes to normal physiological function and structure.` },
    { question: q4, options: [`It works with ${anatomyContext.relatedSystems.join(' and ')} to support body function.`, 'It is unrelated to physiology', 'It only functions in isolation', 'It has no clinical importance'], correctAnswer: 0, explanation: `${baseName} interacts with other body systems as part of normal physiology.` },
    { question: q5, options: [anatomyContext.relatedSystems[0] || 'Circulatory system', 'Only skin', 'Only bone', 'No system'], correctAnswer: 0, explanation: `The listed related system is a major functional partner for ${baseName}.` }
  ];
}

async function fetchGroqResponse(
  apiKey: string,
  model: string,
  promptText: string,
  question: string,
  mode: RequestMode,
  anatomyContext: AnatomyContext,
  compareContext?: AnatomyContext,
  strictJsonOnly = false
): Promise<string> {
  const attemptRequest = async (extraDirective?: string): Promise<string> => {
    const finalPrompt = [
      extraDirective ? `${extraDirective}\n` : '',
      promptText
    ].filter(Boolean).join('\n\n');

    const resp = await fetch('https://api.groq.com/openai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      },
      body: JSON.stringify({
        model,
        input: [{
          role: 'user',
          content: finalPrompt
        }]
      })
    });

    const rawBody = await resp.text().catch(() => '');

    if (!resp.ok) {
      let groqError = rawBody || 'Unknown Groq error';
      try {
        const parsed = JSON.parse(rawBody) as Record<string, unknown>;
        const errorValue = parsed.error;
        if (errorValue && typeof errorValue === 'object') {
          const message = (errorValue as Record<string, unknown>).message;
          if (typeof message === 'string' && message.trim()) {
            groqError = message;
          }
        }
      } catch {
        // fallback to raw text
      }

      console.error('Groq API request failed', {
        status: resp.status,
        body: rawBody || '[empty response body]',
        error: groqError
      });

      if (resp.status === 429) {
        throw new Error(`Groq API rate limit exceeded: HTTP ${resp.status} - ${groqError}`);
      }

      throw new Error(`Groq API request failed: HTTP ${resp.status} - ${groqError}`);
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      throw new Error(`Malformed Groq provider response: ${rawBody.slice(0, 300) || 'empty body'}`);
    }

    const answer = (() => {
      const outputText = data.output_text;
      if (typeof outputText === 'string' && outputText.trim()) {
        return outputText.trim();
      }

      const output = Array.isArray(data.output) ? data.output as unknown[] : [];
      for (const item of output) {
        if (!item || typeof item !== 'object') continue;

        const entry = item as Record<string, unknown>;
        const type = entry.type;
        if (type === 'message' && Array.isArray(entry.content)) {
          const texts = (entry.content as unknown[])
            .map((contentItem) => {
              const candidate = contentItem as Record<string, unknown>;
              if (typeof candidate.text === 'string' && candidate.text.trim()) {
                return candidate.text.trim();
              }
              if (typeof candidate.value === 'string' && candidate.value.trim()) {
                return candidate.value.trim();
              }
              return '';
            })
            .filter((text) => text.length > 0)
            .join('\n');

          if (texts.trim()) return texts.trim();
        }
      }

      return '';
    })();

    if (!answer) {
      throw new Error(`Malformed Groq provider response: ${rawBody.slice(0, 300) || 'empty body'}`);
    }

    return answer;
  };

  const initialAnswer = await attemptRequest();

  if (strictJsonOnly) {
    return initialAnswer;
  }

  const sanitizedAnswer = sanitizeStudentFacingAnswer(initialAnswer);

  const looksUsable =
    !looksLikePromptLeak(sanitizedAnswer) &&
    sanitizedAnswer.length > 25 &&
    !/^(?:need to|output|question:|answer:|using provided context|using the context|the user asks|the anatomy context says|the prompt|the instructions|we need to|we should|let me explain)/i.test(sanitizedAnswer.trim()) &&
    !/\b(?:question|instructions|prompt|context|answer|output)\s*[:;.-]/i.test(sanitizedAnswer.trim());

  if (looksUsable) {
    return sanitizedAnswer;
  }

  return buildStudentAnswerFromContext(mode, anatomyContext, question, compareContext);
}

export async function handleAnatomyChat(body: RequestBody): Promise<ChatResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  if (!model) {
    throw new Error('Server configuration error: GROQ_MODEL is not set');
  }

  const { question, anatomyContext, compareContext, mode } = body;
  const normalizedMode = mode || 'ask';

  if (normalizedMode === 'compare' && (!compareContext || typeof compareContext !== 'object' || !compareContext.id)) {
    throw new Error('Compare mode requires a second anatomy context');
  }

  if (normalizedMode === 'quiz-me') {
    const firstAttemptPrompt = buildPromptPayload(anatomyContext, question, normalizedMode, compareContext, true);
    try {
      const answer = await fetchGroqResponse(apiKey, model, firstAttemptPrompt, question, normalizedMode, anatomyContext, compareContext, true);
      return { quiz: parseQuizJson(answer) };
    } catch (firstError) {
      const retryPrompt = buildPromptPayload(anatomyContext, question, normalizedMode, compareContext, true);
      try {
        const retryAnswer = await fetchGroqResponse(apiKey, model, retryPrompt, question, normalizedMode, anatomyContext, compareContext, true);
        return { quiz: parseQuizJson(retryAnswer) };
      } catch (secondError) {
        const message = secondError instanceof Error ? secondError.message : String(secondError);
        throw new Error(`Quiz generation failed: Groq returned invalid JSON after retry. ${message}`);
      }
    }
  }

  const prompt = buildPromptPayload(anatomyContext, question, normalizedMode, compareContext, false);
  const answer = await fetchGroqResponse(apiKey, model, prompt, question, normalizedMode, anatomyContext, compareContext);
  return { answer };
}
