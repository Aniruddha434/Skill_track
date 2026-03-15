import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import type {
  UserProfile,
  AssessmentResult,
  ResumeAnalysis,
  InterviewSession,
  Notification,
  DashboardData,
} from '../types';

interface UserDataContextType {
  profile: UserProfile | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  // Feature gating: real counts from DB
  assessmentCount: number;
  hasResumeAnalysis: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  saveAssessmentResult: (result: Omit<AssessmentResult, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  saveResumeAnalysis: (analysis: Omit<ResumeAnalysis, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  saveInterviewSession: (session: Omit<InterviewSession, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  fetchDashboardData: () => Promise<DashboardData>;
  fetchAssessmentHistory: () => Promise<AssessmentResult[]>;
  fetchResumeHistory: () => Promise<ResumeAnalysis[]>;
  fetchInterviewHistory: () => Promise<InterviewSession[]>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [hasResumeAnalysis, setHasResumeAnalysis] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setNotifications(data as Notification[]);
  }, [user]);

  // Fetch feature gating counts from DB
  const fetchGatingData = useCallback(async () => {
    if (!user) {
      setAssessmentCount(0);
      setHasResumeAnalysis(false);
      return;
    }
    const [assessRes, resumeRes] = await Promise.all([
      supabase
        .from('assessment_results')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('resume_analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);
    setAssessmentCount(assessRes.count ?? 0);
    setHasResumeAnalysis((resumeRes.count ?? 0) > 0);
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    fetchGatingData();
  }, [fetchProfile, fetchNotifications, fetchGatingData]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) return { error: error.message };
    await fetchProfile();
    return { error: null };
  };

  const saveAssessmentResult = async (result: Omit<AssessmentResult, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: user.id,
        topic: result.topic,
        score: result.score,
        total_questions: result.total_questions,
        questions: result.questions,
        answers: result.answers,
      });

    if (error) return { error: error.message };

    // Update gating count
    setAssessmentCount(prev => prev + 1);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Assessment Completed',
      message: `You scored ${result.score}/${result.total_questions} on ${result.topic}!`,
      type: 'success',
    });
    await fetchNotifications();

    return { error: null };
  };

  const saveResumeAnalysis = async (analysis: Omit<ResumeAnalysis, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('resume_analyses')
      .insert({
        user_id: user.id,
        file_name: analysis.file_name,
        resume_text: analysis.resume_text,
        score: analysis.score,
        summary: analysis.summary,
        skills: analysis.skills,
        career_paths: analysis.career_paths,
        improvements: analysis.improvements,
        strengths: analysis.strengths,
      });

    if (error) return { error: error.message };

    // Update gating flag
    setHasResumeAnalysis(true);

    // Update profile skills if we got new ones
    if (analysis.skills.length > 0 && profile) {
      const mergedSkills = [...new Set([...profile.skills, ...analysis.skills])];
      await updateProfile({ skills: mergedSkills });
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Resume Analyzed',
      message: `Your resume scored ${analysis.score}/100. ${analysis.improvements.length} improvements suggested.`,
      type: 'info',
    });
    await fetchNotifications();

    return { error: null };
  };

  const saveInterviewSession = async (session: Omit<InterviewSession, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        role: session.role,
        messages: session.messages,
        feedback: session.feedback,
        status: session.status,
        completed_at: session.status === 'completed' ? new Date().toISOString() : null,
      });

    if (error) return { error: error.message };

    if (session.feedback) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Interview Completed',
        message: `Mock interview for ${session.role} completed! Overall score: ${session.feedback.overallScore}%`,
        type: 'success',
      });
      await fetchNotifications();
    }

    return { error: null };
  };

  const fetchDashboardData = async (): Promise<DashboardData> => {
    if (!user) {
      return {
        skillScore: 0,
        assessmentsTaken: 0,
        resumeScore: 0,
        interviewsCompleted: 0,
        recentAssessments: [],
        recentAnalysis: null,
        skillProgress: [],
      };
    }

    const [assessRes, resumeRes, interviewRes] = await Promise.all([
      supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed'),
    ]);

    const assessments = (assessRes.data || []) as AssessmentResult[];
    const latestResume = (resumeRes.data?.[0] || null) as ResumeAnalysis | null;
    const interviews = (interviewRes.data || []) as InterviewSession[];

    // Calculate average skill score from assessments
    const avgScore = assessments.length > 0
      ? Math.round(assessments.reduce((acc, a) => acc + (a.score / a.total_questions) * 100, 0) / assessments.length)
      : 0;

    // Build progress data from last 7 assessments
    const skillProgress = assessments.slice(0, 7).reverse().map((a) => ({
      date: new Date(a.created_at || '').toLocaleDateString('en-US', { weekday: 'short' }),
      score: Math.round((a.score / a.total_questions) * 100),
    }));

    return {
      skillScore: avgScore,
      assessmentsTaken: assessments.length,
      resumeScore: latestResume?.score || 0,
      interviewsCompleted: interviews.length,
      recentAssessments: assessments.slice(0, 5),
      recentAnalysis: latestResume,
      skillProgress,
    };
  };

  const fetchAssessmentHistory = async (): Promise<AssessmentResult[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data || []) as AssessmentResult[];
  };

  const fetchResumeHistory = async (): Promise<ResumeAnalysis[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data || []) as ResumeAnalysis[];
  };

  const fetchInterviewHistory = async (): Promise<InterviewSession[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data || []) as InterviewSession[];
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    await fetchNotifications();
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    await fetchNotifications();
  };

  return (
    <UserDataContext.Provider
      value={{
        profile,
        notifications,
        unreadCount,
        loading,
        assessmentCount,
        hasResumeAnalysis,
        fetchProfile,
        updateProfile,
        saveAssessmentResult,
        saveResumeAnalysis,
        saveInterviewSession,
        fetchDashboardData,
        fetchAssessmentHistory,
        fetchResumeHistory,
        fetchInterviewHistory,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
