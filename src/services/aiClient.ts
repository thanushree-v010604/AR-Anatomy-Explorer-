import { AnatomySystem } from '../types/anatomy';

export type AIMessage = { role: 'user' | 'assistant' | 'system'; content: string };
export type AnatomyAIMode = 'ask' | 'explain-simply' | 'deep-dive' | 'study-summary' | 'quiz-me' | 'compare';

export type AIQuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type AIResponse = {
  answer?: string;
  quiz?: AIQuizQuestion[];
  followUps?: string[];
};

export async function askAI(
  system: Partial<AnatomySystem>,
  question: string,
  mode: AnatomyAIMode = 'ask',
  compareContext?: Partial<AnatomySystem>
): Promise<AIResponse> {
  const payload = {
    question,
    anatomyContext: {
      id: system.id,
      name: system.name,
      category: system.category,
      difficulty: system.difficulty,
      description: system.description,
      keyPoints: system.keyPoints,
      funFacts: system.funFacts,
      relatedSystems: system.relatedSystems
    },
    compareContext: compareContext ? {
      id: compareContext.id,
      name: compareContext.name,
      category: compareContext.category,
      difficulty: compareContext.difficulty,
      description: compareContext.description,
      keyPoints: compareContext.keyPoints,
      funFacts: compareContext.funFacts,
      relatedSystems: compareContext.relatedSystems
    } : undefined,
    mode
  };

  const res = await fetch('/api/anatomy-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown error');
    throw new Error(`AI service error: ${errText}`);
  }

  const data = await res.json();
  if (data?.quiz) return { quiz: data.quiz };
  if (data?.answer) return { answer: data.answer };
  throw new Error('AI returned no answer');
}

export function suggestedQuestionsFor(system: Partial<AnatomySystem>) {
  const name = system.name || 'this topic';
  return [
    `What is the primary function of the ${name}?`,
    `How does the ${name} interact with other systems?`,
    `What are the most important things to remember about the ${name}?`
  ];
}
