import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, MailCheck } from 'lucide-react';

const VerifyEmail: React.FC = () => {
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
          <h2 className="text-4xl font-black leading-tight mb-4">Verify Your Email</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Please check your inbox for a verification link before logging in. This keeps your account secure.
          </p>
        </div>
      </div>

      {/* Right side */}
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

          <h1 className="text-3xl font-bold text-slate-900 mb-3">Email Verification Required</h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            We sent a verification link to your email when you signed up. Please click the link in that email to activate your account.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">What to do:</h3>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <p className="text-sm text-slate-600">Open your email inbox (check spam/junk folder too)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <p className="text-sm text-slate-600">Click the <strong>"Confirm your email"</strong> link</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <p className="text-sm text-slate-600">Come back and <strong>log in</strong> with your credentials</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight size={18} />
            </Link>

            <Link
              to="/signup"
              className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Sign Up Again
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-6 leading-relaxed">
            Didn't receive the email? Check your spam folder, or sign up again to get a new verification link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
