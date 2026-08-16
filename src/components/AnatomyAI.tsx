import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain, RefreshCcw, Trash } from 'lucide-react';
import { anatomySystems } from '../data/anatomyData';
import { AnatomySystem, QuizQuestion } from '../types/anatomy';
import { askAI, AIMessage, AnatomyAIMode, suggestedQuestionsFor } from '../services/aiClient';

interface AnatomyAIProps {
  system: AnatomySystem;
}

export const AnatomyAI: React.FC<AnatomyAIProps> = ({ system }) => {
  const modeOptions: Array<{ key: AnatomyAIMode; label: string }> = [
    { key: 'ask', label: 'Ask' },
    { key: 'explain-simply', label: 'Explain Simply' },
    { key: 'deep-dive', label: 'Deep Dive' },
    { key: 'study-summary', label: 'Study Summary' },
    { key: 'quiz-me', label: 'Quiz Me' },
    { key: 'compare', label: 'Compare' }
  ];

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [compareTargetId, setCompareTargetId] = useState<string>('');
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});

  const compareOptions = useMemo(
    () => anatomySystems.filter((item) => item.id !== system.id),
    [system.id]
  );

  useEffect(() => {
    setMessages([{ role: 'system', content: `Context: ${system.name} — ${system.description}` }]);
    setSuggested(suggestedQuestionsFor(system));
    setGeneratedQuiz([]);
    setInput('');
    setError(null);
    setCompareTargetId(compareOptions[0]?.id ?? system.id);
  }, [system, compareOptions]);

  const send = async (text: string, mode: AnatomyAIMode = 'ask') => {
    if (!text) return;
    setError(null);
    const userMsg: AIMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const compareContext = mode === 'compare'
        ? anatomySystems.find((item) => item.id === compareTargetId) ?? undefined
        : undefined;

      const resp = await askAI(system, text, mode, compareContext);

      if (resp.quiz) {
        const validatedQuiz: QuizQuestion[] = resp.quiz.map((q, index) => ({
          id: `${system.id}-quiz-${Date.now()}-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          systemId: system.id,
          difficulty: system.difficulty
        }));
        setGeneratedQuiz(validatedQuiz);
        setMessages((prev) => [...prev, { role: 'assistant', content: `Generated a 5-question quiz for ${system.name}.` }]);
        return;
      }

      if (resp.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: resp.answer || '' }]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI service unavailable. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeClick = (mode: AnatomyAIMode) => {
    const promptByMode: Record<AnatomyAIMode, string> = {
      ask: `What is the main function of the ${system.name}?`,
      'explain-simply': `Explain the ${system.name} simply for a beginner.`,
      'deep-dive': `Give a detailed anatomy explanation of the ${system.name}.`,
      'study-summary': `Create concise study notes for the ${system.name}.`,
      'quiz-me': `Generate a 5-question multiple-choice quiz for the ${system.name}.`,
      compare: `Compare the ${system.name} and ${anatomySystems.find((item) => item.id === compareTargetId)?.name ?? 'the selected anatomy system'}.`
    };

    const nextInput = input.trim() || promptByMode[mode];
    setInput(nextInput);
    void send(nextInput, mode);
  };

  const handleClear = () => {
    setMessages([{ role: 'system', content: `Context: ${system.name} — ${system.description}` }]);
    setSuggested(suggestedQuestionsFor(system));
    setGeneratedQuiz([]);
    setQuizStarted(false);
    setQuizIndex(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setError(null);
  };

  const currentQuestion = generatedQuiz[quizIndex];
  const score = generatedQuiz.reduce((total, question, index) => total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0), 0);

  const normalizeMarkdown = (markdown: string) => {
    if (!markdown) return '';

    return markdown
      .replace(/\r\n/g, '\n')
      .replace(/([^\n])(?=\s*#{1,6}\s)/g, '$1\n\n')
      .replace(/([^\n])(?=\s*[-*]\s+(?!-))/g, '$1\n')
      .replace(/([^\n])(?=\s*\d+\.\s)/g, '$1\n')
      .replace(/(#{1,6}\s+)([^\n])/g, '$1\n$2')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 style={{ fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.35, margin: '1.25rem 0 0.75rem', color: '#0f172a' }}>{children}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.4, margin: '1.5rem 0 0.75rem', color: '#0f172a' }}>{children}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, margin: '1.25rem 0 0.5rem', color: '#0f172a' }}>{children}</h3>
      ),
      p: ({ children }: { children?: React.ReactNode }) => (
        <p style={{ fontSize: '15px', lineHeight: 1.7, margin: '0 0 0.75rem', fontWeight: 400, color: '#334155' }}>{children}</p>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul style={{ margin: '0.75rem 0 0.75rem 1.25rem', paddingLeft: '1.25rem', color: '#334155', listStylePosition: 'outside', fontWeight: 400 }}>{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol style={{ margin: '0.75rem 0 0.75rem 1.25rem', paddingLeft: '1.25rem', color: '#334155', listStylePosition: 'outside', fontWeight: 400 }}>{children}</ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li style={{ marginBottom: '0.45rem', fontWeight: 400, lineHeight: 1.6, color: '#334155' }}>{children}</li>
      ),
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong style={{ fontWeight: 700, color: '#0f172a' }}>{children}</strong>
      ),
      em: ({ children }: { children?: React.ReactNode }) => <em style={{ fontStyle: 'italic', fontWeight: 400 }}>{children}</em>,
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a href={href} target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline', textUnderlineOffset: '0.2rem' }}>{children}</a>
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
        <div style={{ margin: '0.75rem 0 1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{children}</table>
        </div>
      ),
      th: ({ children }: { children?: React.ReactNode }) => <th style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', fontWeight: 700, textAlign: 'left', color: '#0f172a' }}>{children}</th>,
      td: ({ children }: { children?: React.ReactNode }) => <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', verticalAlign: 'top', fontWeight: 400 }}>{children}</td>,
      blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote style={{ margin: '0.75rem 0', paddingLeft: '1rem', borderLeft: '4px solid #bfdbfe', color: '#475569' }}>{children}</blockquote>
    }),
    []
  );

  const handleQuizAnswer = (optionIndex: number) => {
    if (answeredQuestions[quizIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [quizIndex]: optionIndex }));
    setAnsweredQuestions((prev) => ({ ...prev, [quizIndex]: true }));
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setQuizIndex(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
  };

  return (
    <div className="mt-8 w-full rounded-3xl border border-blue-100 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm sm:p-7 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-900">Anatomy AI</h4>
            <p className="text-sm text-slate-600 sm:text-base">Ask me anything about the {system.name}.</p>
          </div>
        </div>
        <button aria-label="Clear conversation" onClick={handleClear} className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-blue-200 hover:text-blue-700">
          <Trash className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {modeOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleModeClick(option.key)}
            disabled={loading}
            className="min-h-[48px] rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {option.label}
          </button>
        ))}
      </div>

      {compareOptions.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-slate-700">Compare</span>
          <select
            aria-label="Compare anatomy system"
            value={compareTargetId}
            onChange={(event) => setCompareTargetId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
          >
            {compareOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 leading-7 ${m.role === 'assistant' ? 'border border-slate-200 bg-slate-50 text-slate-800' : m.role === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-slate-100 text-slate-700'}`}
          >
            {m.role === 'assistant' ? (
              <div
                className="markdown-body max-w-none text-slate-700"
                style={{
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: '#334155'
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {normalizeMarkdown(m.content)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-[15px] whitespace-pre-wrap sm:text-base">{m.content}</div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {generatedQuiz.length > 0 && !quizStarted && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <h5 className="mb-3 text-base font-semibold text-green-800">Quiz ready</h5>
          <button
            onClick={() => {
              setQuizStarted(true);
              setQuizIndex(0);
              setSelectedAnswers({});
              setAnsweredQuestions({});
            }}
            className="bg-green-600 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:bg-green-700"
          >
            Start Quiz
          </button>
        </div>
      )}

      {generatedQuiz.length > 0 && quizStarted && currentQuestion && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-green-700">
            Question {quizIndex + 1} / {generatedQuiz.length}
          </p>
          <h5 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">{currentQuestion.question}</h5>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers[quizIndex] === optionIndex;
              const isCorrect = optionIndex === currentQuestion.correctAnswer;
              const revealAnswer = answeredQuestions[quizIndex];

              let optionClassName = 'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition sm:text-base';
              if (revealAnswer) {
                if (isCorrect) {
                  optionClassName += ' border-green-500 bg-green-100 text-green-800';
                } else if (isSelected) {
                  optionClassName += ' border-red-400 bg-red-100 text-red-800';
                } else {
                  optionClassName += ' border-slate-200 bg-white text-slate-700';
                }
              } else {
                optionClassName += isSelected ? ' border-blue-500 bg-blue-50 text-blue-800' : ' border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
              }

              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
                  onClick={() => handleQuizAnswer(optionIndex)}
                  disabled={Boolean(answeredQuestions[quizIndex])}
                  className={optionClassName}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>

          {answeredQuestions[quizIndex] && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className={`text-sm font-semibold ${selectedAnswers[quizIndex] === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                {selectedAnswers[quizIndex] === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect.'}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => {
                if (quizIndex < generatedQuiz.length - 1) {
                  setQuizIndex((prev) => prev + 1);
                } else {
                  setQuizIndex(generatedQuiz.length);
                }
              }}
              disabled={!answeredQuestions[quizIndex]}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {quizIndex < generatedQuiz.length - 1 ? 'Next Question' : 'See Score'}
            </button>
          </div>
        </div>
      )}

      {generatedQuiz.length > 0 && quizStarted && quizIndex >= generatedQuiz.length && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <h5 className="mb-3 text-base font-semibold text-green-800">Quiz complete</h5>
          <p className="text-xl font-bold text-slate-900">Score: {score} / {generatedQuiz.length}</p>
          <button
            onClick={handleRestartQuiz}
            className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            Restart Quiz
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Ask Anatomy AI"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void send(input, 'ask');
            }
          }}
          placeholder={`Ask about ${system.name}...`}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={() => void send(input || `What is the main function of the ${system.name}?`, 'ask')}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h5 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Suggested</h5>
        <div className="flex flex-wrap gap-2.5">
          {suggested.map((q, i) => (
            <button
              key={i}
              onClick={() => void send(q, 'ask')}
              className="rounded-full border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnatomyAI;
