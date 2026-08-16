import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Brain, Target, Zap } from 'lucide-react';
import { AnatomySystem, QuizQuestion } from '../types/anatomy';
import { quizQuestions } from '../data/quizData';

interface QuizModeProps {
  systems: AnatomySystem[];
  studiedSystems: Set<string>;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  systems,
  studiedSystems
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const generateQuestions = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    // Filter questions based on difficulty and studied systems
    const studiedSystemIds = Array.from(studiedSystems);
    const filteredQuestions = quizQuestions.filter(q => 
      q.difficulty === difficulty && studiedSystemIds.includes(q.systemId)
    );

    // Take up to 10 questions
    const selectedQuestions = filteredQuestions.slice(0, 10);
    setAvailableQuestions(selectedQuestions);
    setUserAnswers(new Array(selectedQuestions.length).fill(null));
  }, [studiedSystems]);

  useEffect(() => {
    if (selectedDifficulty) {
      generateQuestions(selectedDifficulty);
    }
  }, [selectedDifficulty, generateQuestions]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);
    
    if (answerIndex === availableQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < availableQuestions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
      }
    }, 2500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setSelectedDifficulty(null);
    setAvailableQuestions([]);
    setUserAnswers([]);
  };

  const getAvailableQuestionsCount = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const studiedSystemIds = Array.from(studiedSystems);
    return quizQuestions.filter(q => 
      q.difficulty === difficulty && studiedSystemIds.includes(q.systemId)
    ).length;
  };

  // Difficulty selection screen
  if (!selectedDifficulty) {
    const difficulties = [
      {
        id: 'beginner',
        title: 'Beginner',
        description: 'Basic anatomy concepts and fundamental knowledge',
        icon: Brain,
        color: 'green',
        questionsAvailable: getAvailableQuestionsCount('beginner')
      },
      {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'More detailed anatomy and physiological processes',
        icon: Target,
        color: 'yellow',
        questionsAvailable: getAvailableQuestionsCount('intermediate')
      },
      {
        id: 'advanced',
        title: 'Advanced',
        description: 'Complex anatomy and specialized medical knowledge',
        icon: Zap,
        color: 'red',
        questionsAvailable: getAvailableQuestionsCount('advanced')
      }
    ] as const;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Challenge</h1>
          <p className="text-xl text-gray-600">
            Select a difficulty level to test your anatomy knowledge
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {difficulties.map((difficulty) => {
            const colorClasses = {
              green: {
                bg: 'bg-green-50 hover:bg-green-100',
                border: 'border-green-200 hover:border-green-300',
                icon: 'text-green-600',
                button: 'bg-green-600 hover:bg-green-700'
              },
              yellow: {
                bg: 'bg-yellow-50 hover:bg-yellow-100',
                border: 'border-yellow-200 hover:border-yellow-300',
                icon: 'text-yellow-600',
                button: 'bg-yellow-600 hover:bg-yellow-700'
              },
              red: {
                bg: 'bg-red-50 hover:bg-red-100',
                border: 'border-red-200 hover:border-red-300',
                icon: 'text-red-600',
                button: 'bg-red-600 hover:bg-red-700'
              }
            };

            const colors = colorClasses[difficulty.color];

            return (
              <div
                key={difficulty.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-3xl p-8 transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-2xl ${colors.bg} mb-6`}>
                    <difficulty.icon className={`w-12 h-12 ${colors.icon}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {difficulty.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {difficulty.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-sm text-gray-500">Available Questions</span>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.min(difficulty.questionsAvailable, 10)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    disabled={difficulty.questionsAvailable === 0}
                    className={`w-full ${colors.button} text-white py-3 px-6 rounded-xl font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {difficulty.questionsAvailable === 0 ? 'Study More First' : 'Start Quiz'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {studiedSystems.size === 0 && (
          <div className="text-center mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-200">
            <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Start Learning First!
            </h3>
            <p className="text-gray-600">
              Explore anatomy systems in the "Explore" tab to unlock quiz questions.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (availableQuestions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-6">
            Study more anatomy systems to unlock {selectedDifficulty} level questions.
          </p>
          <button
            onClick={resetQuiz}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Choose Different Level
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / availableQuestions.length) * 100);
    const getPerformanceMessage = () => {
      if (percentage >= 90) return { message: "Outstanding! You're an anatomy expert!", color: "text-green-600" };
      if (percentage >= 80) return { message: "Excellent work! You have strong knowledge.", color: "text-blue-600" };
      if (percentage >= 70) return { message: "Good job! Keep studying to improve.", color: "text-yellow-600" };
      return { message: "Keep learning! Review the topics and try again.", color: "text-red-600" };
    };

    const performance = getPerformanceMessage();

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedDifficulty?.charAt(0).toUpperCase() + selectedDifficulty?.slice(1)} Quiz Completed!
          </h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {percentage}%
          </div>
          <p className="text-xl text-gray-600 mb-2">
            You scored {score} out of {availableQuestions.length} questions correctly!
          </p>
          <p className={`text-lg font-medium mb-8 ${performance.color}`}>
            {performance.message}
          </p>

          {/* Question Review */}
          <div className="text-left mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Question Review</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableQuestions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        Question {index + 1}: {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Different Level</span>
            </button>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setScore(0);
                setQuizCompleted(false);
                setUserAnswers(new Array(availableQuestions.length).fill(null));
              }}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Retake Same Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = availableQuestions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDifficulty?.charAt(0).toUpperCase() + selectedDifficulty?.slice(1)} Quiz
            </h2>
            <p className="text-gray-600">Test your anatomy knowledge</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {availableQuestions.length}
            </div>
            <div className="text-lg font-bold text-blue-600">
              Score: {score}/{availableQuestions.length}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / availableQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {question.question}
              </h3>
              <button
                onClick={resetQuiz}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {systems.find(s => s.id === question.systemId)?.name || 'General Anatomy'}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                selectedDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                selectedDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedDifficulty}
              </span>
            </div>
          </div>

          <div className="grid gap-4 mb-8">
            {question.options.map((option, index) => {
              let buttonClass = "w-full p-6 text-left rounded-xl border-2 transition-all duration-200 ";
              
              if (showResult) {
                if (index === question.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800 shadow-lg";
                } else if (index === selectedAnswer && index !== question.correctAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800 shadow-lg";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else {
                buttonClass += selectedAnswer === index 
                  ? "border-blue-500 bg-blue-50 text-blue-800 shadow-lg transform scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800 hover:shadow-md hover:transform hover:scale-[1.01]";
              }

              return (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-bold text-lg">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium text-lg flex-1">{option}</span>
                    {showResult && index === question.correctAnswer && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`border-2 rounded-xl p-6 ${
              selectedAnswer === question.correctAnswer 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start space-x-3">
                {selectedAnswer === question.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-1" />
                )}
                <div>
                  <h4 className={`font-bold mb-2 ${
                    selectedAnswer === question.correctAnswer ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className={`${
                    selectedAnswer === question.correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};