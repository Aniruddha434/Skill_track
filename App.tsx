import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { CacheProvider } from './contexts/CacheContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SkillAssessment from './pages/SkillAssessment';
import ResumeUpload from './pages/ResumeUpload';
import CareerRecommendation from './pages/CareerRecommendation';
import JobRecommendation from './pages/JobRecommendation';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import LearningRecommendation from './pages/LearningRecommendation';
import Profile from './pages/Profile';
import MockInterview from './pages/MockInterview';
import VerifyEmail from './pages/VerifyEmail';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><SkillAssessment /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/careers" element={<ProtectedRoute><CareerRecommendation /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobRecommendation /></ProtectedRoute>} />
        <Route path="/gaps" element={<ProtectedRoute><SkillGapAnalysis /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><LearningRecommendation /></ProtectedRoute>} />
        <Route path="/mock" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <UserDataProvider>
          <CacheProvider>
            <AppRoutes />
          </CacheProvider>
        </UserDataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
