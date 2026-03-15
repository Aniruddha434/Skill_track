import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, Search, Loader2, RefreshCw, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import { fetchRealJobs } from '../services/jinaJobService';
import type { ExperienceLevel } from '../services/jinaJobService';
import { useUserData } from '../contexts/UserDataContext';
import { useCache } from '../contexts/CacheContext';
import FeatureGate, { useFullGateRequirements } from '../components/FeatureGate';
import type { Job } from '../types';

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'fresher', label: 'Fresher / Intern' },
  { value: 'junior', label: 'Junior (0-2 yrs)' },
  { value: 'mid', label: 'Mid-Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' },
  { value: 'any', label: 'Any Level' },
];

/**
 * Auto-detect experience level from user profile.
 * If user has no experience or only internships, default to 'fresher'.
 */
function detectExperienceLevel(profile: any): ExperienceLevel {
  if (!profile) return 'fresher';
  const exp = profile.experience || [];
  if (exp.length === 0) return 'fresher';
  // Check if all entries look like internships or student roles
  const internKeywords = ['intern', 'trainee', 'student', 'fresher', 'apprentice'];
  const allInterns = exp.every((e: any) =>
    internKeywords.some(k => (e.title || '').toLowerCase().includes(k))
  );
  if (allInterns) return 'fresher';
  if (exp.length <= 2) return 'junior';
  return 'mid';
}

const JobRecommendation: React.FC = () => {
  const { profile } = useUserData();
  const { cache, setJobs: cacheJobs } = useCache();
  const [jobs, setJobs] = useState<Job[]>(cache.jobs || []);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(cache.jobs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('fresher');

  // Auto-detect experience level when profile loads
  React.useEffect(() => {
    if (profile) {
      setExperienceLevel(detectExperienceLevel(profile));
    }
  }, [profile]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');

    const skills = profile?.skills || [];
    const targetRole = customRole || profile?.target_role || 'Software Developer';
    const location = customLocation || profile?.location || 'India';

    try {
      const result = await fetchRealJobs(skills, targetRole, location, experienceLevel);
      if (result && result.length > 0) {
        setJobs(result);
        setFilteredJobs(result);
        cacheJobs(result);
      } else {
        setError('No jobs found. Try a different role or location.');
      }
    } catch (err) {
      console.error('Job fetch error:', err);
      setError('Failed to fetch job listings. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && !cache.jobs) {
      fetchJobs();
    }
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredJobs(
        jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q) ||
            j.skills.some((s) => s.toLowerCase().includes(q))
        )
      );
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

  const gateRequirements = useFullGateRequirements();

  return (
    <FeatureGate featureName="Job Board" requirements={gateRequirements}>
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-900">Job Opportunities</h1>
          <p className="text-slate-500 flex items-center gap-1 text-sm">
            <Globe size={14} className="flex-shrink-0" />
            <span className="truncate">Real jobs from LinkedIn, Naukri, Unstop & Glassdoor{profile?.skills.length ? ` -- matched against your ${profile.skills.length} skills.` : '.'}</span>
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Role / Keywords</label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder={profile?.target_role || 'e.g., React Developer'}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Location</label>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder={profile?.location || 'e.g., Bangalore, India'}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium appearance-none cursor-pointer"
            >
              {EXPERIENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => fetchJobs()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => fetchJobs()}
              disabled={loading}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-all flex-shrink-0"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Quick filter by text */}
        {jobs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter results by title, company, location, skill..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && !jobs.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Scraping jobs from LinkedIn, Naukri, Unstop & Glassdoor...</p>
            <p className="text-slate-400 text-sm mt-1">This may take 10-15 seconds as we fetch from multiple sites</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
          <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => fetchJobs()} className="mt-3 text-sm text-blue-600 font-bold hover:underline">Try Again</button>
        </div>
      ) : (
        <>
          {jobs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-bold">{filteredJobs.length}</span> real job listings
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              {loading && <Loader2 size={16} className="text-blue-600 animate-spin" />}
            </div>
          )}

          <div className="grid gap-4">
            {filteredJobs.length === 0 && !loading ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                {searchQuery ? 'No jobs match your filter.' : 'Search for jobs using the form above.'}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center gap-6 group overflow-hidden">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-500 text-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex-shrink-0">
                    {job.company.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors break-words">{job.title}</h3>
                      {job.matchPercentage > 0 && profile?.skills.length ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          job.matchPercentage >= 70 ? 'bg-green-50 text-green-700' :
                          job.matchPercentage >= 50 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {job.matchPercentage}% Match
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm overflow-hidden">
                      <span className="font-semibold text-slate-900 truncate max-w-[200px]">{job.company}</span>
                      {job.location && <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>}
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                      {job.salary && job.salary !== 'See listing' && (
                        <span className="font-semibold text-green-700">{job.salary}</span>
                      )}
                      {/* Source badge */}
                      {(() => {
                        const src = job.description.match(/Source:\s*(LinkedIn|Naukri|Unstop|Glassdoor)/);
                        if (!src) return null;
                        const colors: Record<string, string> = {
                          LinkedIn: 'bg-blue-50 text-blue-700 border-blue-100',
                          Naukri: 'bg-purple-50 text-purple-700 border-purple-100',
                          Unstop: 'bg-orange-50 text-orange-700 border-orange-100',
                          Glassdoor: 'bg-teal-50 text-teal-700 border-teal-100',
                        };
                        return (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${colors[src[1]] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            {src[1]}
                          </span>
                        );
                      })()}
                    </div>
                    {job.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 overflow-hidden">
                        {job.skills.map((skill) => (
                          <span key={skill} className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                            profile?.skills.some(s => s.toLowerCase() === skill.toLowerCase())
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end lg:flex-col lg:items-end lg:justify-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 flex-shrink-0">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                      View & Apply <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
    </FeatureGate>
  );
};

export default JobRecommendation;
