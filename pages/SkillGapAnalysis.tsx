import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, AlertTriangle, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { analyzeSkillGaps } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { useCache } from '../contexts/CacheContext';
import type { SkillGap } from '../types';

const SkillGapAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserData();
  const { cache, setSkillGap: cacheSkillGap } = useCache();
  const [gaps, setGaps] = useState<SkillGap[]>(cache.skillGap?.gaps || []);
  const [readinessScore, setReadinessScore] = useState(cache.skillGap?.readinessScore || 0);
  const [targetRole, setTargetRole] = useState(cache.skillGap?.targetRole || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGaps = async () => {
    setLoading(true);
    setError('');

    const skills = profile?.skills || [];
    const role = profile?.target_role || 'Software Developer';

    if (skills.length === 0) {
      setError('Please add skills to your profile first. The AI needs your skill list to analyze gaps.');
      setLoading(false);
      return;
    }

    const result = await analyzeSkillGaps(skills, role);
    if (result) {
      setGaps(result.gaps || []);
      setReadinessScore(result.readinessScore || 0);
      setTargetRole(result.targetRole || role);
      cacheSkillGap({
        gaps: result.gaps || [],
        readinessScore: result.readinessScore || 0,
        targetRole: result.targetRole || role,
      });
    } else {
      setError('Failed to analyze skill gaps. Please check your API key and try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && !cache.skillGap) {
      fetchGaps();
    }
  }, [profile]);

  const criticalGaps = gaps.filter(g => g.requiredLevel - g.currentLevel > 30);
  const moderateGaps = gaps.filter(g => {
    const diff = g.requiredLevel - g.currentLevel;
    return diff > 10 && diff <= 30;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Gap Analysis</h1>
          <p className="text-slate-500">
            Target Role: <span className="font-bold text-blue-600">{targetRole || profile?.target_role || 'Set a target role in your profile'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGaps}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Re-analyze
          </button>
          {readinessScore > 0 && (
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Readiness</p>
                <p className="text-2xl font-black text-slate-900">{readinessScore}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && !gaps.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">AI is analyzing your skills vs industry requirements...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-center font-medium">
          {error}
          <button
            onClick={() => navigate('/profile')}
            className="mt-3 block mx-auto text-blue-600 font-bold text-sm hover:underline"
          >
            Go to Profile
          </button>
        </div>
      ) : gaps.length > 0 ? (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Current vs Required Proficiency</h3>
              <p className="text-sm text-slate-500 mt-1">Based on industry standards for {targetRole}.</p>
            </div>
            <div className="p-8 space-y-10">
              {gaps.map((gap) => (
                <div key={gap.skill} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{gap.skill}</h4>
                      {gap.requiredLevel - gap.currentLevel > 30 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase">Critical Gap</span>
                      )}
                      {gap.currentLevel >= gap.requiredLevel && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold uppercase">Met</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1">Gap</span>
                      <span className="text-sm font-bold text-slate-900">
                        {gap.currentLevel >= gap.requiredLevel ? 'Skill met!' : `${gap.requiredLevel - gap.currentLevel}% to goal`}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-slate-900 z-10"
                      style={{ left: `${Math.min(gap.requiredLevel, 100)}%` }}
                    >
                      <div className="absolute -top-6 -right-3 whitespace-nowrap text-[10px] font-bold text-slate-900 uppercase">Required</div>
                    </div>
                    <div
                      className={`absolute top-0 bottom-0 rounded-full transition-all duration-1000 delay-300 ${
                        gap.currentLevel >= gap.requiredLevel ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(gap.currentLevel, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>0%</span>
                    <span>Your Level: {gap.currentLevel}%</span>
                    <span>100%</span>
                  </div>
                  {gap.recommendation && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Tip:</strong> {gap.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {criticalGaps.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Critical Gaps ({criticalGaps.length})</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  These skills have significant gaps. Prioritize learning them to improve your readiness score.
                </p>
                <ul className="space-y-2 mb-6">
                  {criticalGaps.map(g => (
                    <li key={g.skill} className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {g.skill} ({g.requiredLevel - g.currentLevel}% gap)
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/learning')}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  View Learning Recommendations
                </button>
              </div>
            )}

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Recommended Next Steps</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Visit the Learning Hub for AI-curated courses specifically targeting your skill gaps.
              </p>
              <button
                onClick={() => navigate('/learning')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Go to Learning Hub
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-lg font-medium">No gap analysis data yet.</p>
          <p className="text-sm mt-1">Add skills and a target role to your profile, then click Re-analyze.</p>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
