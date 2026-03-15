import React, { useState, useRef, useEffect } from 'react';
import { Video, Send, User, Bot, Sparkles, ChevronRight, Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { startInterview, sendInterviewResponse, generateInterviewFeedback } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { INTERVIEW_ROLES } from '../constants';
import type { InterviewMessage, InterviewFeedback } from '../types';

const MockInterview: React.FC = () => {
  const { saveInterviewSession } = useUserData();
  const [step, setStep] = useState<'setup' | 'active' | 'ending' | 'feedback'>('setup');
  const [role, setRole] = useState(INTERVIEW_ROLES[0]);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const initInterview = async () => {
    setStep('active');
    setMessages([]);
    setIsTyping(true);
    const firstQuestion = await startInterview(role);
    setMessages([{ role: 'model', text: firstQuestion }]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue;
    const newMessages: InterviewMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    const aiResponse = await sendInterviewResponse(role, newMessages, userMsg);
    const updatedMessages: InterviewMessage[] = [...newMessages, { role: 'model', text: aiResponse || '' }];
    setMessages(updatedMessages);
    setIsTyping(false);
  };

  const endInterview = async () => {
    if (messages.length < 2) {
      setStep('setup');
      return;
    }

    setStep('ending');

    // Generate real AI feedback
    const feedbackResult = await generateInterviewFeedback(role, messages);

    if (feedbackResult) {
      setFeedback(feedbackResult);

      // Save to Supabase
      await saveInterviewSession({
        role,
        messages,
        feedback: feedbackResult,
        status: 'completed',
      });
    } else {
      // Fallback feedback
      setFeedback({
        technicalAccuracy: 70,
        communicationScore: 75,
        problemSolving: 65,
        overallScore: 70,
        strengths: ['Completed the interview session'],
        improvements: ['Try to give more detailed answers', 'Practice more technical concepts'],
        summary: 'Interview feedback could not be fully generated. Please try again with a valid API key.',
      });
    }

    setStep('feedback');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-5xl mx-auto py-4 h-[calc(100vh-140px)] flex flex-col">
      {/* SETUP */}
      {step === 'setup' && (
        <div className="flex-1 flex items-center justify-center animate-in zoom-in-95 duration-500">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl max-w-xl w-full text-center glass-depth">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
              <Video size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">AI Mock Interview</h1>
            <p className="text-slate-500 mb-10 text-lg font-medium">Practice with a real AI interviewer. Get instant feedback on your responses.</p>

            <div className="space-y-6 mb-10 text-left">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Your Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
                >
                  {INTERVIEW_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={initInterview}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Start Session <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW */}
      {step === 'active' && (
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden glass-depth animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white relative">
                <Bot size={24} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-bold tracking-tight">AI Interviewer</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{role} Interview</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700">
                {messages.filter(m => m.role === 'user').length} responses
              </span>
              <button
                className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                onClick={endInterview}
              >
                End Interview
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                      : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-4 relative">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response here..."
                disabled={isTyping}
                className="flex-1 p-5 pr-16 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-90 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENDING / GENERATING FEEDBACK */}
      {step === 'ending' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={64} className="text-blue-600 animate-spin mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Analyzing Your Performance</h2>
            <p className="text-slate-500 text-lg">AI is evaluating your {messages.filter(m => m.role === 'user').length} responses...</p>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {step === 'feedback' && feedback && (
        <div className="flex-1 flex items-center justify-center animate-in zoom-in-95 duration-700">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl max-w-2xl w-full glass-depth">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner animate-float">
                <Trophy size={48} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Interview Complete!</h1>
              <p className="text-slate-500 text-lg font-medium">Here's your AI-generated performance report.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Technical</p>
                <p className={`text-2xl font-black ${getScoreColor(feedback.technicalAccuracy)}`}>{feedback.technicalAccuracy}%</p>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 text-center">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Communication</p>
                <p className={`text-2xl font-black ${getScoreColor(feedback.communicationScore)}`}>{feedback.communicationScore}%</p>
              </div>
              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 text-center">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Problem Solving</p>
                <p className={`text-2xl font-black ${getScoreColor(feedback.problemSolving)}`}>{feedback.problemSolving}%</p>
              </div>
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 text-center">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Overall</p>
                <p className={`text-2xl font-black ${getScoreColor(feedback.overallScore)}`}>{feedback.overallScore}%</p>
              </div>
            </div>

            <div className="text-left bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-500" /> AI Feedback Summary
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">{feedback.summary}</p>

              {feedback.strengths.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improvements.length > 0 && (
                <div>
                  <h5 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Areas to Improve</h5>
                  <ul className="space-y-1">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">-</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setStep('setup'); setMessages([]); setFeedback(null); }}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Practice Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
