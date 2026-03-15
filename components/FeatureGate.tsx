import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Target, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

interface Requirement {
  label: string;
  met: boolean;
  action: string;   // Button label
  path: string;      // Navigate to
}

interface FeatureGateProps {
  children: React.ReactNode;
  featureName: string;
  requirements: Requirement[];
}

const FeatureGate: React.FC<FeatureGateProps> = ({ children, featureName, requirements }) => {
  const navigate = useNavigate();
  const allMet = requirements.every(r => r.met);

  if (allMet) {
    return <>{children}</>;
  }

  const completedCount = requirements.filter(r => r.met).length;
  const progressPct = Math.round((completedCount / requirements.length) * 100);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-lg w-full text-center">
        {/* Lock icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-slate-100 rounded-full animate-pulse opacity-50"></div>
          <div className="relative w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-200">
            <Lock size={36} className="text-slate-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{featureName} is Locked</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Complete the steps below to unlock this feature. We need real data from your profile to give you meaningful results.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
            <span className="text-xs font-bold text-slate-900">{completedCount}/{requirements.length} complete</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* Requirements checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left">
          {requirements.map((req, i) => (
            <div
              key={i}
              className={`p-5 flex items-center gap-4 ${i < requirements.length - 1 ? 'border-b border-slate-100' : ''} ${
                req.met ? 'bg-green-50/50' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                req.met ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {req.met ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${req.met ? 'text-green-700 line-through' : 'text-slate-900'}`}>
                  {req.label}
                </p>
              </div>

              {!req.met && (
                <button
                  onClick={() => navigate(req.path)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex-shrink-0"
                >
                  {req.action} <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;

// ===============================
// Pre-built gate hooks for common patterns
// ===============================

/** Requires: profile has skills + target_role */
export function useProfileGateRequirements() {
  const { profile } = useUserData();
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasTargetRole = !!profile?.target_role;

  return [
    {
      label: 'Add skills to your profile',
      met: hasSkills,
      action: 'Edit Profile',
      path: '/profile',
    },
    {
      label: 'Set a target role',
      met: hasTargetRole,
      action: 'Edit Profile',
      path: '/profile',
    },
  ];
}

/** Requires: profile skills + target_role + 2 assessments + resume analyzed */
export function useFullGateRequirements() {
  const { profile, assessmentCount, hasResumeAnalysis } = useUserData();
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasTargetRole = !!profile?.target_role;
  const hasTwoAssessments = assessmentCount >= 2;

  return [
    {
      label: 'Add skills to your profile',
      met: hasSkills,
      action: 'Edit Profile',
      path: '/profile',
    },
    {
      label: 'Set a target role',
      met: hasTargetRole,
      action: 'Edit Profile',
      path: '/profile',
    },
    {
      label: `Complete at least 2 skill assessments (${assessmentCount}/2)`,
      met: hasTwoAssessments,
      action: 'Take Assessment',
      path: '/assessment',
    },
    {
      label: 'Analyze your resume',
      met: hasResumeAnalysis,
      action: 'Upload Resume',
      path: '/resume',
    },
  ];
}
