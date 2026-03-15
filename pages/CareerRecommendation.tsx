import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ShieldCheck, DollarSign, BrainCircuit, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getCareerRecommendations, generateCareerRoadmap } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { useCache } from '../contexts/CacheContext';
import type { Career } from '../types';

const CareerRecommendation: React.FC = () => {
  const { profile } = useUserData();
  const { cache, setCareers: cacheCareers, setRoadmap: cacheRoadmap } = useCache();
  const [careers, setCareers] = useState<Career[]>(cache.careers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);
  const [roadmapContent, setRoadmapContent] = useState<Record<string, string>>(cache.roadmaps || {});
  const [loadingRoadmap, setLoadingRoadmap] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    const skills = profile?.skills || [];
    const experience = profile?.experience?.map(e => `${e.title} at ${e.org}`).join(', ') || 'No experience listed';
    const interests = profile?.target_role || profile?.bio || 'General technology career';

    const result = await getCareerRecommendations(skills, experience, interests);
    if (result) {
      setCareers(result);
      cacheCareers(result);
    } else {
      setError('Failed to generate recommendations. Please check your API key and try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && !cache.careers) {
      fetchRecommendations();
    }
  }, [profile]);

  const handleViewRoadmap = async (career: Career) => {
    if (expandedRoadmap === career.id) {
      setExpandedRoadmap(null);
      return;
    }

    setExpandedRoadmap(career.id);

    if (roadmapContent[career.id]) return;

    setLoadingRoadmap(career.id);
    const roadmap = await generateCareerRoadmap(profile?.skills || [], career.title);
    if (roadmap) {
      setRoadmapContent(prev => ({ ...prev, [career.id]: roadmap }));
      cacheRoadmap(career.id, roadmap);
    }
    setLoadingRoadmap(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-900">Career Recommendations</h1>
          <p className="text-slate-500 mt-2">
            {profile?.skills.length
              ? `Personalized for your ${profile.skills.length} skills and ${profile.target_role || 'career goals'}.`
              : 'Add skills to your profile for personalized recommendations.'}
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && !careers.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">AI is analyzing your profile and generating career matches...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-center font-medium">
          {error}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <div key={career.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="h-32 bg-slate-100 p-6 flex justify-between items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 relative z-10">
                    <BrainCircuit size={28} />
                  </div>
                  <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-slate-600 shadow-sm relative z-10">
                    {career.matchPercentage}% Match
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{career.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{career.description}</p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.requiredSkills.map((skill) => (
                          <span key={skill} className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            profile?.skills.includes(skill)
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <DollarSign size={16} /> Salary Range
                      </div>
                      <span className="font-bold text-slate-900">{career.salaryRange}</span>
                    </div>
                  </div>

                  {/* Roadmap steps preview */}
                  {career.roadmap && career.roadmap.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Roadmap</h4>
                      <ol className="space-y-2">
                        {career.roadmap.slice(0, 3).map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-[10px]">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="mt-auto">
                    <button
                      onClick={() => handleViewRoadmap(career)}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                      {expandedRoadmap === career.id ? 'Hide' : 'View Full'} Roadmap
                      {expandedRoadmap === career.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded roadmap */}
                {expandedRoadmap === career.id && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50 animate-in fade-in duration-300">
                    {loadingRoadmap === career.id ? (
                      <div className="flex items-center gap-3 justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-blue-600" />
                        <span className="text-sm text-slate-500">Generating detailed roadmap...</span>
                      </div>
                    ) : roadmapContent[career.id] ? (
                      <div className="prose prose-sm max-w-none text-slate-700">
                        <pre className="whitespace-pre-wrap text-xs font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-100">{roadmapContent[career.id]}</pre>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Context Card */}
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <ShieldCheck size={160} />
            </div>
            <div className="max-w-2xl relative z-10">
              <h3 className="text-2xl font-bold mb-4">Recommendations are personalized</h3>
              <p className="text-blue-100 mb-4 leading-relaxed">
                These career paths are generated by AI based on your profile skills ({profile?.skills.length || 0} skills),
                experience, and target role. Update your profile to get better matches.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CareerRecommendation;
