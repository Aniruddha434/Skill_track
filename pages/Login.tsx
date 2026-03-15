import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      // Detect unverified email and redirect to verification page
      if (authError.toLowerCase().includes('email not confirmed') || authError.toLowerCase().includes('email not verified')) {
        navigate('/verify-email');
        return;
      }
      setError(authError);
      setIsLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-8 sm:mb-10">
            <div className="bg-blue-600 text-white font-bold p-1.5 rounded-lg">ST</div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">SkillTrack</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 mb-8 sm:mb-10 font-medium">Please enter your details to sign in to your account.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-600 font-medium">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create account</Link>
          </p>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-10">
          <div className="w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="bg-blue-600 text-white font-bold w-12 h-12 flex items-center justify-center rounded-2xl text-2xl mb-8">ST</div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6 italic">"The best way to predict your future is to create it."</h2>
          <p className="text-slate-400 text-xl max-w-lg leading-relaxed">Sign in to access your personalized career dashboard, AI-powered assessments, and smart recommendations.</p>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 font-medium">Powered by Google Gemini AI + Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
