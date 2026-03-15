import React from 'react';
import {
  LayoutDashboard,
  Target,
  Briefcase,
  FileText,
  BookOpen,
  BarChart2,
  ShieldCheck,
  Video,
  User
} from 'lucide-react';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#0f172a',
  accent: '#3b82f6',
  background: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0'
};

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { name: 'Profile', icon: <User size={20} />, path: '/profile' },
  { name: 'Skill Assessment', icon: <Target size={20} />, path: '/assessment' },
  { name: 'Resume Analysis', icon: <FileText size={20} />, path: '/resume' },
  { name: 'Career Match', icon: <ShieldCheck size={20} />, path: '/careers' },
  { name: 'Job Board', icon: <Briefcase size={20} />, path: '/jobs' },
  { name: 'Skill Gaps', icon: <BarChart2 size={20} />, path: '/gaps' },
  { name: 'Learning Hub', icon: <BookOpen size={20} />, path: '/learning' },
  { name: 'Mock Interviews', icon: <Video size={20} />, path: '/mock' },
];

// Assessment topic options
export const ASSESSMENT_TOPICS = [
  'React.js',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'Java',
  'System Design',
  'Data Structures & Algorithms',
  'SQL & Databases',
  'HTML & CSS',
  'Machine Learning',
  'Cloud Computing (AWS)',
  'DevOps & CI/CD',
  'Cybersecurity Basics',
  'REST APIs',
];

// Interview role options
export const INTERVIEW_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Mobile Developer',
  'Cloud Architect',
];
