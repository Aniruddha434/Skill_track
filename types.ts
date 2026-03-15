// ===== User & Profile =====
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  github_url: string;
  linkedin_url: string;
  avatar_url: string;
  skills: string[];
  target_role: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  title: string;
  org: string;
  period: string;
}

export interface EducationItem {
  title: string;
  org: string;
  period: string;
}

// ===== Skill Assessment =====
export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AssessmentResult {
  id?: string;
  user_id?: string;
  topic: string;
  score: number;
  total_questions: number;
  questions: AssessmentQuestion[];
  answers: number[];
  created_at?: string;
}

// ===== Resume Analysis =====
export interface ResumeAnalysis {
  id?: string;
  user_id?: string;
  file_name: string;
  resume_text: string;
  score: number;
  summary: string;
  skills: string[];
  career_paths: string[];
  improvements: string[];
  strengths: string[];
  created_at?: string;
}

// Extended resume analysis result from AI (includes profile extraction)
export interface ResumeAnalysisExtracted extends ResumeAnalysis {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  bio: string;
  targetRole: string;
  experience: ExperienceItem[];
  education: EducationItem[];
}

// ===== Career & Job Recommendations =====
export interface Career {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  requiredSkills: string[];
  salaryRange: string;
  roadmap: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchPercentage: number;
  skills: string[];
  description: string;
  applyUrl: string;
}

// ===== Skill Gap Analysis =====
export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  recommendation: string;
}

// ===== Learning Recommendations =====
export interface Course {
  id: string;
  title: string;
  platform: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  link: string;
  description: string;
  relevance: string;
}

// ===== Mock Interview =====
export interface InterviewMessage {
  role: 'user' | 'model';
  text: string;
}

export interface InterviewFeedback {
  technicalAccuracy: number;
  communicationScore: number;
  problemSolving: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface InterviewSession {
  id?: string;
  user_id?: string;
  role: string;
  messages: InterviewMessage[];
  feedback: InterviewFeedback | null;
  status: 'active' | 'completed';
  created_at?: string;
  completed_at?: string;
}

// ===== Notifications =====
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'welcome';
  read: boolean;
  created_at: string;
}

// ===== Dashboard Stats =====
export interface DashboardData {
  skillScore: number;
  assessmentsTaken: number;
  resumeScore: number;
  interviewsCompleted: number;
  recentAssessments: AssessmentResult[];
  recentAnalysis: ResumeAnalysis | null;
  skillProgress: { date: string; score: number }[];
}
