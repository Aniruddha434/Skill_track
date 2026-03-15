import React, { useState, useEffect } from 'react';
import { ExternalLink, Play, Clock, Loader2, RefreshCw, BookOpen, Youtube } from 'lucide-react';
import { getLearningRecommendations } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import { useCache } from '../contexts/CacheContext';
import FeatureGate, { useProfileGateRequirements } from '../components/FeatureGate';
import type { Course } from '../types';

interface FreeResource {
  title: string;
  type: string;
  link: string;
}

interface YouTubeVideo {
  title: string;
  channel: string;
  link: string;
  duration: string;
  description: string;
}

const LearningRecommendation: React.FC = () => {
  const { profile } = useUserData();
  const { cache, setLearning: cacheLearning } = useCache();
  const [courses, setCourses] = useState<Course[]>(cache.learning?.courses || []);
  const [freeResources, setFreeResources] = useState<FreeResource[]>(cache.learning?.freeResources || []);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>(cache.learning?.youtubeVideos || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    const skills = profile?.skills || [];
    const targetRole = profile?.target_role || 'Software Developer';

    // Use skills as gap areas (the AI will figure out what to recommend)
    const gapAreas = skills.length > 0
      ? skills
      : ['JavaScript', 'React', 'Python']; // Default if no skills

    const result = await getLearningRecommendations(gapAreas, targetRole);
    if (result) {
      setCourses(result.courses || []);
      setFreeResources(result.freeResources || []);
      setYoutubeVideos(result.youtubeVideos || []);
      cacheLearning({
        courses: result.courses || [],
        freeResources: result.freeResources || [],
        youtubeVideos: result.youtubeVideos || [],
      });
    } else {
      setError('Failed to generate learning recommendations. Please check your API key and try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && !cache.learning) {
      fetchRecommendations();
    }
  }, [profile]);

  const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('coursera')) return 'bg-blue-600 text-white';
    if (p.includes('udemy')) return 'bg-purple-600 text-white';
    if (p.includes('linkedin')) return 'bg-sky-600 text-white';
    if (p.includes('edx')) return 'bg-red-600 text-white';
    if (p.includes('freecodecamp')) return 'bg-green-600 text-white';
    return 'bg-slate-900 text-white';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600';
      case 'Intermediate': return 'text-yellow-600';
      case 'Advanced': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const gateRequirements = useProfileGateRequirements();

  return (
    <FeatureGate featureName="Learning Hub" requirements={gateRequirements}>
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Learning Hub</h1>
          <p className="text-slate-500 mt-2">
            AI-curated courses and resources to bridge your skill gaps and accelerate your career.
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

      {loading && !courses.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">AI is curating the best courses for your skill profile...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-center font-medium">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getPlatformColor(course.platform)}`}>
                      {course.platform}
                    </span>
                    <span className={`text-xs font-bold ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{course.description}</p>

                  {course.relevance && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                      <p className="text-xs text-blue-700 font-medium">
                        <strong>Why this course:</strong> {course.relevance}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-1.5"><Clock size={14} /> {course.duration}</div>
                    <div className="flex items-center gap-1.5"><Play size={14} /> {course.difficulty}</div>
                  </div>

                  <div className="mt-auto">
                    <a
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-slate-100 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all group/btn"
                    >
                      Start Learning <ExternalLink size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* YouTube Videos Section */}
          {youtubeVideos.length > 0 && (
            <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <Youtube size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">YouTube Videos</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {youtubeVideos.map((video, i) => (
                  <a
                    key={i}
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-5 rounded-2xl border border-red-100 hover:border-red-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Play size={14} className="text-red-600 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest truncate">{video.channel}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-auto flex-shrink-0">{video.duration}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors text-sm leading-snug mb-2 line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-auto line-clamp-2">{video.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Free Resources Section */}
          {freeResources.length > 0 && (
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Free Community Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {freeResources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">{resource.type}</span>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{resource.title}</h4>
                  </a>
                ))}
              </div>
            </div>
          )}

          {courses.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <p className="text-lg font-medium">No learning recommendations yet.</p>
              <p className="text-sm mt-1">Complete your profile with skills and a target role to get personalized course suggestions.</p>
            </div>
          )}
        </>
      )}
    </div>
    </FeatureGate>
  );
};

export default LearningRecommendation;
