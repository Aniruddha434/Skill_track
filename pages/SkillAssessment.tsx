import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Trophy, Clock, Sparkles, Target, Loader2 } from 'lucide-react';
import { generateAssessmentQuestions } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { ASSESSMENT_TOPICS } from '../constants';
import type { AssessmentQuestion } from '../types';

const SkillAssessment: React.FC = () => {
  const { saveAssessmentResult } = useUserData();
  const [currentStep, setCurrentStep] = useState(0); // 0: Setup, 1: Loading, 2: Quiz, 3: Result
  const [topic, setTopic] = useState(ASSESSMENT_TOPICS[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startQuiz = async () => {
    setCurrentStep(1);
    setLoadError('');
    const result = await generateAssessmentQuestions(topic, difficulty, questionCount);
    if (result && result.length > 0) {
      setQuestions(result);
      setAnswers(new Array(result.length).fill(-1));
      setCurrentStep(2);
      setCurrentQuestionIndex(0);
      setStartTime(Date.now());
    } else {
      setLoadError('Failed to generate questions. Please check your Gemini API key and try again.');
      setCurrentStep(0);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showExplanation) return; // Don't allow changing after submitting
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitAnswer = () => {
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    let finalScore = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    setCurrentStep(3);

    // Save to Supabase
    await saveAssessmentResult({
      topic,
      score: finalScore,
      total_questions: questions.length,
      questions,
      answers,
    });
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setQuestions([]);
    setAnswers([]);
    setScore(0);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      {/* SETUP SCREEN */}
      {currentStep === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-12 border border-slate-100 shadow-2xl text-center glass-depth animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-5 sm:mb-8 shadow-inner animate-float">
            <Trophy size={32} className="sm:hidden" />
            <Trophy size={48} className="hidden sm:block" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">AI Skill Assessment</h1>
          <p className="text-slate-500 mb-6 sm:mb-10 max-w-lg mx-auto leading-relaxed text-base sm:text-lg">
            Select a topic and difficulty. Our AI will generate unique questions tailored to your chosen settings.
          </p>

          {loadError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
              {loadError}
            </div>
          )}

          <div className="max-w-md mx-auto space-y-4 sm:space-y-6 text-left mb-8 sm:mb-12">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
              >
                {ASSESSMENT_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full sm:w-auto bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/25 hover:scale-105 active:scale-95"
          >
            Generate & Start Assessment
          </button>
        </div>
      )}

      {/* LOADING SCREEN */}
      {currentStep === 1 && (
        <div className="bg-white rounded-[2.5rem] p-16 border border-slate-100 shadow-2xl text-center glass-depth">
          <Loader2 size={64} className="text-blue-600 animate-spin mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Generating Your Assessment</h2>
          <p className="text-slate-500 text-lg font-medium">AI is crafting {questionCount} unique {difficulty} questions on {topic}...</p>
        </div>
      )}

      {/* QUIZ SCREEN */}
      {currentStep === 2 && questions.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden glass-depth animate-in slide-in-from-right-8 duration-500">
          <div className="bg-slate-900 p-4 sm:p-8 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">{topic}</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{difficulty} difficulty</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border border-slate-700 flex-shrink-0">
              <Clock size={16} className="text-blue-400 hidden sm:block" />
              <span>Q {currentQuestionIndex + 1}/{questions.length}</span>
            </div>
          </div>

          <div className="px-4 sm:px-10 pt-6 sm:pt-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full mb-12 overflow-hidden shadow-inner">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-10 leading-snug tracking-tight">
              {questions[currentQuestionIndex].question}
            </h3>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {questions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                const isCorrect = idx === questions[currentQuestionIndex].correctAnswer;
                let borderClass = 'border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50';

                if (showExplanation) {
                  if (isCorrect) borderClass = 'border-green-500 bg-green-50 text-green-900';
                  else if (isSelected && !isCorrect) borderClass = 'border-red-500 bg-red-50 text-red-900';
                  else borderClass = 'border-slate-100 bg-slate-50 text-slate-400';
                } else if (isSelected) {
                  borderClass = 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg shadow-blue-600/10';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={showExplanation}
                    className={`w-full p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex items-center justify-between group gap-3 ${borderClass}`}
                  >
                    <span className="text-sm sm:text-lg font-bold">{option}</span>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      showExplanation && isCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : showExplanation && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : isSelected
                        ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-lg'
                        : 'border-slate-200'
                    }`}>
                      {(isSelected || (showExplanation && isCorrect)) && <CheckCircle2 size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl mb-8 animate-in fade-in duration-300">
                <p className="text-sm font-bold text-blue-900 mb-1">Explanation:</p>
                <p className="text-sm text-blue-800">{questions[currentQuestionIndex].explanation}</p>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-10 bg-slate-50/50 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              onClick={() => { setShowExplanation(false); setCurrentQuestionIndex((prev) => Math.max(0, prev - 1)); }}
              disabled={currentQuestionIndex === 0 || showExplanation}
              className="flex items-center gap-1 sm:gap-2 text-slate-500 font-bold disabled:opacity-30 hover:text-slate-900 transition-colors text-sm sm:text-base"
            >
              <ChevronLeft size={18} /> Back
            </button>
            {!showExplanation ? (
              <button
                onClick={submitAnswer}
                disabled={answers[currentQuestionIndex] === -1}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 text-sm sm:text-base"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Results' : 'Next'} <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-16 border border-slate-100 shadow-2xl text-center glass-depth animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 sm:w-32 sm:h-32 bg-green-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-green-600 mx-auto mb-6 sm:mb-10 relative animate-float shadow-inner">
            <CheckCircle2 size={40} className="sm:hidden" />
            <CheckCircle2 size={64} className="hidden sm:block" />
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-yellow-400 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border-4 border-white">
              <Trophy size={18} className="sm:hidden" />
              <Trophy size={28} className="hidden sm:block" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">Assessment Complete!</h1>
          <p className="text-slate-500 mb-8 sm:mb-12 text-sm sm:text-lg font-medium">Your {topic} assessment has been analyzed and saved to your profile.</p>

          <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-16">
            <div className="bg-blue-50/50 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border border-blue-100/50 shadow-sm">
              <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">Score</p>
              <p className="text-2xl sm:text-4xl font-black text-blue-600">{Math.round((score / questions.length) * 100)}%</p>
            </div>
            <div className="bg-green-50/50 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border border-green-100/50 shadow-sm">
              <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">Correct</p>
              <p className="text-2xl sm:text-4xl font-black text-green-600">{score}/{questions.length}</p>
            </div>
            <div className="bg-purple-50/50 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border border-purple-100/50 shadow-sm">
              <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">Time</p>
              <p className="text-2xl sm:text-4xl font-black text-purple-600">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-50 rounded-2xl max-w-sm mx-auto">
              <Sparkles size={20} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-700 tracking-tight">
                {score / questions.length >= 0.8
                  ? 'Excellent performance!'
                  : score / questions.length >= 0.6
                  ? 'Good job! Keep improving.'
                  : 'Keep practicing, you\'ll get there!'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-10 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
              >
                Take Another Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAssessment;
