import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Career, Job, SkillGap, Course } from '../types';

interface SkillGapData {
  gaps: SkillGap[];
  readinessScore: number;
  targetRole: string;
}

interface YouTubeVideo {
  title: string;
  channel: string;
  link: string;
  duration: string;
  description: string;
}

interface LearningData {
  courses: Course[];
  freeResources: { title: string; type: string; link: string }[];
  youtubeVideos: YouTubeVideo[];
}

interface CacheStore {
  careers: Career[] | null;
  roadmaps: Record<string, string>;
  jobs: Job[] | null;
  skillGap: SkillGapData | null;
  learning: LearningData | null;
}

interface CacheContextType {
  cache: CacheStore;
  setCareers: (data: Career[]) => void;
  setRoadmap: (careerId: string, content: string) => void;
  setJobs: (data: Job[]) => void;
  setSkillGap: (data: SkillGapData) => void;
  setLearning: (data: LearningData) => void;
  clearCache: (key?: keyof CacheStore) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<CacheStore>({
    careers: null,
    roadmaps: {},
    jobs: null,
    skillGap: null,
    learning: null,
  });

  const setCareers = useCallback((data: Career[]) => {
    setCache(prev => ({ ...prev, careers: data }));
  }, []);

  const setRoadmap = useCallback((careerId: string, content: string) => {
    setCache(prev => ({ ...prev, roadmaps: { ...prev.roadmaps, [careerId]: content } }));
  }, []);

  const setJobs = useCallback((data: Job[]) => {
    setCache(prev => ({ ...prev, jobs: data }));
  }, []);

  const setSkillGap = useCallback((data: SkillGapData) => {
    setCache(prev => ({ ...prev, skillGap: data }));
  }, []);

  const setLearning = useCallback((data: LearningData) => {
    setCache(prev => ({ ...prev, learning: data }));
  }, []);

  const clearCache = useCallback((key?: keyof CacheStore) => {
    if (key) {
      setCache(prev => ({ ...prev, [key]: key === 'roadmaps' ? {} : null }));
    } else {
      setCache({ careers: null, roadmaps: {}, jobs: null, skillGap: null, learning: null });
    }
  }, []);

  return (
    <CacheContext.Provider value={{ cache, setCareers, setRoadmap, setJobs, setSkillGap, setLearning, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error('useCache must be used within CacheProvider');
  return ctx;
};
