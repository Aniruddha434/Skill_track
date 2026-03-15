import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ShieldCheck, DollarSign, BrainCircuit, Loader2, RefreshCw, ChevronDown, ChevronUp, Calendar, BookOpen, Rocket, CheckCircle2, Code, Target, Zap } from 'lucide-react';
import { getCareerRecommendations, generateCareerRoadmap } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { useCache } from '../contexts/CacheContext';
import FeatureGate, { useProfileGateRequirements } from '../components/FeatureGate';
import type { Career } from '../types';

// ============================================================
// Roadmap text parser -- turns AI-generated text into sections
// ============================================================
interface RoadmapSection {
  title: string;
  items: string[];
}

function parseRoadmapText(text: string): RoadmapSection[] {
  const sections: RoadmapSection[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let current: RoadmapSection | null = null;

  for (const line of lines) {
    // Detect section headers:
    //   "**Month 1: ...**", "## Month 1", "Month 1:", "Phase 1:", "Week 1-2:", etc.
    const headerMatch = line.match(
      /^(?:\*\*|#{1,3}\s*)?(?:Month\s*\d+|Phase\s*\d+|Week\s*[\d\-]+|Step\s*\d+|Quarter\s*\d+)\s*[:–\-]?\s*(.*?)(?:\*\*)?$/i
    );

    // Also match generic bold headers like "**Foundation & Setup**"
    const boldHeaderMatch = !headerMatch && line.match(/^\*\*(.+?)\*\*\s*$/);

    // Also match markdown headers like "## Something" or "### Something"
    const mdHeaderMatch = !headerMatch && !boldHeaderMatch && line.match(/^#{1,3}\s+(.+)$/);

    if (headerMatch) {
      if (current && current.items.length > 0) sections.push(current);
      const suffix = headerMatch[1]?.replace(/\*+/g, '').trim();
      const prefix = line.match(/(?:Month\s*\d+|Phase\s*\d+|Week\s*[\d\-]+|Step\s*\d+|Quarter\s*\d+)/i)?.[0] || '';
      current = {
        title: suffix ? `${prefix}${suffix ? ': ' + suffix : ''}` : prefix,
        items: [],
      };
    } else if (boldHeaderMatch || mdHeaderMatch) {
      if (current && current.items.length > 0) sections.push(current);
      current = {
        title: (boldHeaderMatch?.[1] || mdHeaderMatch?.[1] || '').trim(),
        items: [],
      };
    } else {
      // Clean up bullet points
      const cleaned = line
        .replace(/^[\-\*•]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .trim();

      if (cleaned) {
        if (!current) {
          current = { title: 'Getting Started', items: [] };
        }
        current.items.push(cleaned);
      }
    }
  }

  if (current && current.items.length > 0) sections.push(current);

  // Fallback: if parsing found nothing useful, create one section with all content
  if (sections.length === 0 && text.trim()) {
    const allItems = text
      .split('\n')
      .map(l => l.trim().replace(/^[\-\*•]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean);
    if (allItems.length > 0) {
      sections.push({ title: 'Roadmap', items: allItems });
    }
  }

  return sections;
}

// Section icons based on index
const sectionIcons = [
  <BookOpen size={18} />,
  <Code size={18} />,
  <Target size={18} />,
  <Rocket size={18} />,
  <Zap size={18} />,
  <CheckCircle2 size={18} />,
];

const sectionColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500', light: 'bg-blue-100' },
  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500', light: 'bg-purple-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', light: 'bg-emerald-100' },
  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500', light: 'bg-orange-100' },
  { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', dot: 'bg-pink-500', light: 'bg-pink-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', dot: 'bg-cyan-500', light: 'bg-cyan-100' },
];

// ============================================================
// Roadmap Timeline Component
// ============================================================
const RoadmapTimeline: React.FC<{ content: string }> = ({ content }) => {
  const sections = parseRoadmapText(content);

  if (sections.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 italic">
        No roadmap content available.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {sections.map((section, idx) => {
        const color = sectionColors[idx % sectionColors.length];
        const icon = sectionIcons[idx % sectionIcons.length];
        const isLast = idx === sections.length - 1;

        return (
          <div key={idx} className="relative flex gap-3 sm:gap-5">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color.light} ${color.text} flex items-center justify-center flex-shrink-0 z-10 shadow-sm`}>
                {icon}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
              <div className={`${color.bg} border ${color.border} rounded-xl sm:rounded-2xl p-3 sm:p-5`}>
                <h4 className={`font-bold ${color.text} text-sm sm:text-base mb-3 flex items-center gap-2`}>
                  <Calendar size={14} className="flex-shrink-0 opacity-60" />
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className={`w-1.5 h-1.5 rounded-full ${color.dot} flex-shrink-0 mt-1.5`}></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
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

  const gateRequirements = useProfileGateRequirements();

  return (
    <FeatureGate featureName="Career Match" requirements={gateRequirements}>
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Career Recommendations</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {careers.map((career) => (
              <div key={career.id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="h-32 bg-slate-100 p-6 flex justify-between items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 relative z-10">
                    <BrainCircuit size={28} />
                  </div>
                  <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-slate-600 shadow-sm relative z-10">
                    {career.matchPercentage}% Match
                  </div>
                </div>

                <div className="p-4 sm:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{career.title}</h3>
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
                      <div className="space-y-2.5">
                        {career.roadmap.slice(0, 3).map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-[10px] ${
                              i === 0 ? 'bg-blue-100 text-blue-600' :
                              i === 1 ? 'bg-purple-100 text-purple-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                              {i + 1}
                            </div>
                            <span className="text-xs text-slate-600 leading-relaxed pt-0.5">{step}</span>
                          </div>
                        ))}
                        {career.roadmap.length > 3 && (
                          <p className="text-[10px] text-slate-400 font-medium pl-8">+{career.roadmap.length - 3} more steps...</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    <button
                      onClick={() => handleViewRoadmap(career)}
                      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                        expandedRoadmap === career.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-900 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Rocket size={16} />
                      {expandedRoadmap === career.id ? 'Hide Roadmap' : 'View Full Roadmap'}
                      {expandedRoadmap === career.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded full roadmap */}
                {expandedRoadmap === career.id && (
                  <div className="border-t border-slate-100 bg-slate-50/70 animate-in fade-in slide-in-from-top-2 duration-300">
                    {loadingRoadmap === career.id ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-30"></div>
                          <div className="relative w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-blue-600" />
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Generating your personalized roadmap...</span>
                      </div>
                    ) : roadmapContent[career.id] ? (
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Rocket size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">6-Month Roadmap</h4>
                            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Personalized plan to become a {career.title}</p>
                          </div>
                        </div>
                        <RoadmapTimeline content={roadmapContent[career.id]} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Context Card */}
          <div className="bg-blue-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
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
    </FeatureGate>
  );
};

export default CareerRecommendation;
