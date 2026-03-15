
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Briefcase, 
  Zap, 
  FileText, 
  MessageSquare,
  Sparkles,
  Search,
  Trophy,
  BrainCircuit,
  TrendingUp,
  PlayCircle
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white selection:bg-blue-100 overflow-x-hidden">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-100/30 rounded-full blur-[100px] animate-float-delayed"></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-blue-50/50 rounded-full blur-[80px]"></div>
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 text-white font-black p-1.5 rounded-xl shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">ST</div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">SkillTrack</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          <a href="#features" className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-widest">Platform</a>
          <a href="#solutions" className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-widest">Solutions</a>
          <a href="#pricing" className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-widest">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-slate-700 font-bold px-4 py-2 hover:text-blue-600 transition-colors">Log in</Link>
          <Link to="/signup" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-600/20 active:scale-95">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 z-10 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-8 animate-in slide-in-from-top-4 duration-1000">
              <Sparkles size={14} />
              <span>Version 2.0 Now Live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-8 tracking-tighter">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dream Career</span> <br />
              with AI.
            </h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg font-medium">
              The world's most intelligent career companion. Assess your skills, bridge your gaps, and land roles at top-tier tech companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/signup" className="group flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-2xl shadow-blue-600/30">
                Get Started Free <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/${i+100}/40/40`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-500">
                  <span className="text-slate-900">12k+</span> users already joined
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Floating UI Assembly */}
          <div className="relative h-[600px] hidden lg:block perspective-1000">
            {/* Main App Window */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden rotate-y-[-12deg] rotate-x-[6deg] hover:rotate-0 transition-all duration-1000 ease-out preserve-3d">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
              </div>
              <div className="p-8 space-y-6">
                <div className="h-4 w-3/4 bg-slate-100 rounded-full"></div>
                <div className="h-32 w-full bg-slate-50 rounded-[2rem]"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-blue-50 rounded-2xl"></div>
                  <div className="h-20 bg-indigo-50 rounded-2xl"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 right-0 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-float w-64 transform translate-z-50">
               <div className="flex items-center gap-4 mb-4">
                 <div className="bg-green-100 p-2.5 rounded-2xl text-green-600"><Trophy size={24} /></div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Skill Score</p>
                   <p className="text-2xl font-black text-slate-900">94.2%</p>
                 </div>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-green-500 h-full w-[94%]"></div>
               </div>
            </div>

            <div className="absolute bottom-10 left-[-20px] bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white animate-float-delayed w-72 transform translate-z-100">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black">G</div>
                 <div>
                   <p className="text-sm font-bold">Frontend Engineer</p>
                   <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Google Inc.</p>
                 </div>
               </div>
               <button className="w-full mt-4 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">
                 Quick Apply
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Ticker */}
      <section className="py-12 border-y border-slate-100 bg-white/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-black tracking-tighter text-slate-900">MICROSOFT</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">ADOBE</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">AMAZON</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">INTEL</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">STRIPE</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[0.9]">Everything you need to <span className="text-blue-600">Level Up.</span></h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">We've combined the power of generative AI with career psychology to build a platform that actually works.</p>
            </div>
            <Link to="/assessment" className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform">
              Explore All Tools <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {/* Bento Card: Skill Assessment (Large) */}
            <div className="md:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Adaptive Skill <br /> Assessment</h3>
                <p className="text-slate-500 max-w-sm font-medium">Industry-standard MCQ tests that adapt to your performance level in real-time.</p>
              </div>
              <div className="relative z-10 flex gap-4">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">React</span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">Python</span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">System Design</span>
              </div>
            </div>

            {/* Bento Card: Mock Interview (Small) */}
            <div className="md:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl hover:shadow-indigo-900/20 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare size={200} />
               </div>
               <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                 <BrainCircuit size={28} className="text-blue-400" />
               </div>
               <div>
                 <h3 className="text-2xl font-black mb-2 tracking-tight">AI Interviews</h3>
                 <p className="text-slate-400 text-sm font-medium">Practice with our real-time specialized AI bot.</p>
               </div>
            </div>

            {/* Bento Card: Job Matching (Small) */}
            <div className="md:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                 <Briefcase size={28} />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Match Engine</h3>
                 <p className="text-slate-500 text-sm font-medium">92% accuracy in predicting your success in specific roles.</p>
               </div>
            </div>

            {/* Bento Card: Resume Analysis (Medium) */}
            <div className="md:col-span-4 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <FileText size={28} />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">ATS-Beating Resume</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">Instant feedback on your resume structure and keywords.</p>
              </div>
              <div className="relative z-10 mt-6">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                  <span>ATS Match Rate</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[88%]"></div>
                </div>
              </div>
            </div>

            {/* Bento Card: Learning Paths (Small) */}
            <div className="md:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Curated Paths</h3>
                <p className="text-slate-500 text-sm font-medium">Courses mapped directly to your missing skills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Path */}
      <section id="solutions" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Your path to <span className="text-blue-600 underline decoration-blue-200">Employment</span></h2>
            <p className="text-lg text-slate-500 font-medium">Three simple steps to transition from student to professional.</p>
          </div>

          <div className="relative">
            {/* Visual Path Connector */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-slate-100 hidden md:block">
              <div className="h-20 w-full bg-blue-600 absolute top-0 animate-pulse"></div>
            </div>

            <div className="space-y-32">
              <StepRow 
                number="01" 
                title="Identify Your Gaps" 
                desc="Take the AI-powered assessment and upload your resume. We create a detailed map of where you stand."
                align="left"
                icon={<Search size={32} />}
              />
              <StepRow 
                number="02" 
                title="Bridge with Courses" 
                desc="Access custom learning paths from Coursera and Udemy. Only learn what you actually need."
                align="right"
                icon={<PlayCircle size={32} />}
              />
              <StepRow 
                number="03" 
                title="Land Your Dream Role" 
                desc="Apply through our matched job board with a high-strength resume and practice mock interviews."
                align="left"
                icon={<TrendingUp size={32} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0f172a] rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)]">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[160px] opacity-20"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">Ready to start <br /> your story?</h2>
                <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-md">Join 12,000+ students building their careers with SkillTrack AI today.</p>
                <Link to="/signup" className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-2xl active:scale-95">
                  Get Free Access <ArrowRight />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-40 bg-white/5 backdrop-blur rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-3xl font-black text-white">92%</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Placement Rate</p>
                  </div>
                  <div className="h-56 bg-white/5 backdrop-blur rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-3xl font-black text-white">2.4k+</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Roles Filled</p>
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="h-56 bg-blue-600 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl shadow-blue-600/30">
                    <p className="text-3xl font-black text-white">850+</p>
                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mt-2">Hiring Partners</p>
                  </div>
                  <div className="h-40 bg-white/5 backdrop-blur rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-3xl font-black text-white">4.9/5</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">User Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 text-white font-black p-1.5 rounded-xl">ST</div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">SkillTrack</span>
            </div>
            <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">Revolutionizing the bridge between academia and industry with the world's most intelligent career companion.</p>
            <div className="flex gap-6 mt-10">
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"><Sparkles size={18} /></a>
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"><Zap size={18} /></a>
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"><ArrowRight size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.3em]">Platform</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link to="/assessment" className="hover:text-blue-600">Skill Tests</Link></li>
              <li><Link to="/resume" className="hover:text-blue-600">Resume AI</Link></li>
              <li><Link to="/jobs" className="hover:text-blue-600">Job Board</Link></li>
              <li><Link to="/mock" className="hover:text-blue-600">Mock Interviews</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.3em]">Company</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><a href="#" className="hover:text-blue-600">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2025 SkillTrack AI. Developed by Human Engineers.</p>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Built with React + Gemini</span>
            <span>Final Project Showcase</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StepRow = ({ number, title, desc, align, icon }: { number: string, title: string, desc: string, align: 'left' | 'right', icon: React.ReactNode }) => (
  <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-1 space-y-6 md:text-left text-center">
      <div className="text-6xl font-black text-blue-600/10 tracking-tighter mb-4">{number}</div>
      <h3 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">{desc}</p>
    </div>
    
    <div className="relative flex-1 flex justify-center items-center">
      <div className="w-64 h-64 bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex items-center justify-center text-blue-600 relative z-10 animate-float">
        {icon}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl -z-0"></div>
    </div>
  </div>
);

export default Landing;
