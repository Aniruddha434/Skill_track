import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, MailCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const { error: authError } = await signUp(email, password, fullName);

    if (authError) {
      setError(authError);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}#/dashboard`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        // Start 60-second cooldown
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setError('Failed to resend verification email.');
    }
    setResending(false);
  };

  // Email Verification Screen
  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left side: Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-16 flex-col justify-center items-center relative overflow-hidden text-white">
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-400 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10 text-center max-w-md">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
              <MailCheck size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">Almost There!</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              We've sent a verification link to your email. Once verified, you'll have full access to all AI-powered career tools.
            </p>
          </div>
        </div>

        {/* Right side: Verification info */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="max-w-md w-full text-center">
            <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
              <div className="bg-blue-600 text-white font-bold p-1.5 rounded-lg">ST</div>
              <span className="text-2xl font-bold text-slate-900">SkillTrack</span>
            </div>

            {/* Animated mail icon */}
            <div className="relative mx-auto w-28 h-28 mb-8">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                <Mail size={44} className="text-blue-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3">Check Your Email</h1>
            <p className="text-slate-500 mb-2 font-medium">We've sent a verification link to:</p>
            <p className="text-blue-600 font-bold text-lg mb-8 bg-blue-50 py-3 px-6 rounded-xl inline-block">{email}</p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">What to do next:</h3>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <p className="text-sm text-slate-600">Open your email inbox (check spam/junk too)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">2</span>
                </div>
                <p className="text-sm text-slate-600">Click the <strong>"Confirm your email"</strong> link in the email from SkillTrack</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">3</span>
                </div>
                <p className="text-sm text-slate-600">Come back here and <strong>log in</strong> with your credentials</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resending || resendCooldown > 0}
                className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resending ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : resendCooldown > 0 ? (
                  <>Resend available in {resendCooldown}s</>
                ) : (
                  <>Resend Verification Email</>
                )}
              </button>

              <Link
                to="/login"
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-xs text-slate-400 mt-6 leading-relaxed">
              Didn't receive the email? Check your spam folder, or click "Resend" above. The link expires in 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-16 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="bg-white text-blue-600 font-bold w-12 h-12 flex items-center justify-center rounded-2xl text-2xl mb-12">ST</div>
          <h2 className="text-5xl font-black leading-tight mb-8">Start your career journey with AI today.</h2>
          <ul className="space-y-6">
            <li className="flex items-center gap-4 text-xl">
              <div className="bg-blue-500/50 p-2 rounded-lg"><ShieldCheck size={24} /></div>
              <span>Personalized skill assessments</span>
            </li>
            <li className="flex items-center gap-4 text-xl">
              <div className="bg-blue-500/50 p-2 rounded-lg"><ShieldCheck size={24} /></div>
              <span>AI-powered resume optimization</span>
            </li>
            <li className="flex items-center gap-4 text-xl">
              <div className="bg-blue-500/50 p-2 rounded-lg"><ShieldCheck size={24} /></div>
              <span>Smart job recommendations</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
          <p className="text-lg font-medium leading-relaxed italic">"SkillTrack's AI assessments helped me identify exactly what I needed to learn. Within months I was interview-ready!"</p>
          <div className="flex items-center gap-4 mt-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">A</div>
            <div>
              <p className="font-bold">A Student User</p>
              <p className="text-blue-100 text-sm">SkillTrack Community Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="bg-blue-600 text-white font-bold p-1.5 rounded-lg">ST</div>
            <span className="text-2xl font-bold text-slate-900">SkillTrack</span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 mb-10 font-medium">Set up your profile to unlock career insights.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

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
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">By creating an account, you agree to our Terms and Privacy Policy.</p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Get Started <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-600 font-medium">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
