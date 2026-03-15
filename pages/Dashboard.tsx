import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Clock,
  ChevronRight,
  Plus,
  Target,
  Sparkles,
  FileText,
  Video,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import type { DashboardData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, fetchDashboardData } = useUserData();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDashboardData();
      setDashData(data);
      setLoading(false);
    };
    loadData();
  }, [fetchDashboardData]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = dashData?.skillProgress.length
    ? dashData.skillProgress
    : [{ date: 'Today', score: 0 }];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-1000">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName.split(' ')[0]}!</h1>
            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-slate-500 mt-1">Here's a summary of your career progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> New Assessment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity className="text-blue-600" />}
          label="Skill Score"
          value={dashData?.skillScore ? `${dashData.skillScore}%` : 'N/A'}
          change={dashData?.assessmentsTaken ? `${dashData.assessmentsTaken} assessments taken` : 'Take your first assessment'}
          isPositive={true}
          color="blue"
        />
        <StatCard
          icon={<FileText className="text-green-600" />}
          label="Resume Score"
          value={dashData?.resumeScore ? `${dashData.resumeScore}/100` : 'N/A'}
          change={dashData?.resumeScore ? 'Based on latest analysis' : 'Upload your resume'}
          isPositive={true}
          color="green"
        />
        <StatCard
          icon={<Video className="text-purple-600" />}
          label="Interviews"
          value={`${dashData?.interviewsCompleted || 0}`}
          change={dashData?.interviewsCompleted ? 'Sessions completed' : 'Start a mock interview'}
          isPositive={true}
          color="purple"
        />
        <StatCard
          icon={<Clock className="text-orange-600" />}
          label="Member Since"
          value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New'}
          change={profile?.target_role || 'Set a target role'}
          isPositive={true}
          color="orange"
        />
      </div>

      {/* Main Charts and Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] glass-depth">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Assessment Score History</h3>
          </div>
          {dashData?.skillProgress.length ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 4 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={28}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2563eb' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-center">
              <div>
                <Target className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium mb-2">No assessment data yet</p>
                <button
                  onClick={() => navigate('/assessment')}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Take your first assessment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between group hover-tilt preserve-3d shadow-2xl shadow-blue-900/10 transition-all duration-500">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute bottom-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
            <Target size={180} />
          </div>

          <div className="relative z-10 transform">
            <span className="px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300">Quick Actions</span>
            <h3 className="text-2xl font-bold mt-6 mb-3 leading-tight tracking-tight">
              {profile?.skills.length ? 'Keep Growing' : 'Get Started'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {profile?.skills.length
                ? `You have ${profile.skills.length} skills listed. Keep building your profile!`
                : 'Complete your profile and take an assessment to get personalized recommendations.'}
            </p>
          </div>

          <div className="mt-8 space-y-3 relative z-10">
            <button
              onClick={() => navigate('/resume')}
              className="w-full py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FileText size={16} /> Analyze Resume
            </button>
            <button
              onClick={() => navigate('/mock')}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Video size={16} /> Practice Interview
            </button>
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      {dashData?.recentAssessments && dashData.recentAssessments.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden glass-depth">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Assessments</h3>
            <button
              onClick={() => navigate('/assessment')}
              className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 transition-all"
            >
              Take New Assessment <ChevronRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {dashData.recentAssessments.slice(0, 3).map((assessment, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{assessment.topic}</h4>
                    <p className="text-sm text-slate-500">
                      {new Date(assessment.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">
                    {Math.round((assessment.score / assessment.total_questions) * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {assessment.score}/{assessment.total_questions} correct
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, change, isPositive, color }: { icon: React.ReactNode; label: string; value: string; change: string; isPositive: boolean; color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 group hover-tilt preserve-3d">
      <div className="flex items-center gap-4 mb-5">
        <div className={`p-3 rounded-2xl transition-all duration-300 ${colorMap[color]} group-hover:scale-110 shadow-sm`}>{icon}</div>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        <div className="text-xs mt-2 font-bold text-slate-500">
          {change}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
