
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
  PlayCircle,
  Users,
  Award,
  BookOpen,
  BarChart3
} from 'lucide-react';
import AnimatedHeading from '../components/AnimatedHeading';

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
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-6 max-w-7xl mx-auto sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 text-white font-black p-1.5 rounded-xl shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">ST</div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SkillTrack</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          <a href="#features" className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-widest">Platform</a>
          <a href="#solutions" className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors uppercase tracking-widest">Solutions</a>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/login" className="hidden sm:block text-slate-700 font-bold px-4 py-2 hover:text-blue-600 transition-colors">Log in</Link>
          <Link to="/signup" className="bg-slate-900 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-600/20 active:scale-95">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 z-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 animate-in slide-in-from-top-4 duration-1000">
              <Sparkles size={14} />
              <span>AI-Powered Career Platform</span>
            </div>

            <AnimatedHeading
              as="h1"
              className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-6 sm:mb-8 tracking-tighter"
              letterDelay={25}
              startDelay={200}
            >
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dream Career</span> <br />
              with AI.
            </AnimatedHeading>

            <p className="text-base sm:text-xl text-slate-500 mb-8 sm:mb-12 leading-relaxed max-w-lg font-medium">
              Your intelligent career companion. Assess skills, bridge gaps, ace interviews, and land roles at companies you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/signup" className="group flex items-center justify-center gap-3 bg-blue-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-2xl shadow-blue-600/30">
                Get Started Free <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  {/* User avatars as initials instead of external images */}
                  {['A', 'R', 'S'].map((initial, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-blue-100 text-blue-600' :
                      i === 1 ? 'bg-purple-100 text-purple-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-500">
                  <span className="text-slate-900">Join</span> students & professionals
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

            {/* Floating: Skill Score card */}
            <div className="absolute top-10 right-0 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-float w-64 transform translate-z-50">
               <div className="flex items-center gap-4 mb-4">
                 <div className="bg-green-100 p-2.5 rounded-2xl text-green-600"><Trophy size={24} /></div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Skill Score</p>
                   <p className="text-2xl font-black text-slate-900">Track Yours</p>
                 </div>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-green-500 h-full w-[70%] animate-pulse"></div>
               </div>
            </div>

            {/* Floating: Job card */}
            <div className="absolute bottom-10 left-[-20px] bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white animate-float-delayed w-72 transform translate-z-100">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                   <Briefcase size={20} />
                 </div>
                 <div>
                   <p className="text-sm font-bold">Your Dream Role</p>
                   <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Matched by AI</p>
                 </div>
               </div>
               <button className="w-full mt-4 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">
                 View Matches
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Ticker */}
      <section className="py-12 border-y border-slate-100 bg-white/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Powered by Modern Technology</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-700 flex items-center gap-2"><Sparkles size={18} className="text-blue-500" /> Google Gemini AI</span>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-700 flex items-center gap-2"><Zap size={18} className="text-emerald-500" /> React + Vite</span>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-700 flex items-center gap-2"><BarChart3 size={18} className="text-purple-500" /> Supabase</span>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-700 flex items-center gap-2"><Target size={18} className="text-orange-500" /> Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-16 sm:py-32 px-4 sm:px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-20">
            <div className="max-w-2xl">
              <AnimatedHeading
                as="h2"
                className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-[0.9]"
                letterDelay={20}
                startDelay={100}
              >
                Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Level Up.</span>
              </AnimatedHeading>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">AI-powered tools designed to take you from learning to landing your dream job.</p>
            </div>
            <Link to="/assessment" className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform">
              Explore All Tools <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 auto-rows-auto md:auto-rows-[280px]">
            {/* Bento Card: Skill Assessment (Large) */}
            <div className="md:col-span-8 bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group overflow-hidden relative min-h-[200px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Adaptive Skill <br /> Assessment</h3>
                <p className="text-slate-500 max-w-sm font-medium">AI-generated MCQ tests that adapt to your chosen difficulty and topic in real-time.</p>
              </div>
              <div className="relative z-10 flex gap-4 flex-wrap">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">React</span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">Python</span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">DSA</span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">+ More</span>
              </div>
            </div>

            {/* Bento Card: Mock Interview (Small) */}
            <div className="md:col-span-4 bg-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-xl hover:shadow-indigo-900/20 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden min-h-[180px]">
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare size={200} />
               </div>
               <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                 <BrainCircuit size={28} className="text-blue-400" />
               </div>
               <div>
                 <h3 className="text-2xl font-black mb-2 tracking-tight">AI Interviews</h3>
                 <p className="text-slate-400 text-sm font-medium">Practice with a role-specific AI interviewer and get instant feedback.</p>
               </div>
            </div>

            {/* Bento Card: Job Matching (Small) */}
            <div className="md:col-span-4 bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between min-h-[180px]">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                 <Briefcase size={28} />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Real Job Board</h3>
                 <p className="text-slate-500 text-sm font-medium">Live jobs scraped from LinkedIn, Naukri, Unstop & Glassdoor, matched to your skills.</p>
               </div>
            </div>

            {/* Bento Card: Resume Analysis (Medium) */}
            <div className="md:col-span-4 bg-indigo-600 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-xl flex flex-col justify-between group overflow-hidden relative min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <FileText size={28} />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Smart Resume Analysis</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">AI extracts your skills, experience, and auto-fills your profile from a PDF upload.</p>
              </div>
              <div className="relative z-10 mt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-indigo-200" />
                  <span className="text-xs font-bold text-indigo-200">Auto-fill profile from resume</span>
                </div>
              </div>
            </div>

            {/* Bento Card: Learning Paths (Small) */}
            <div className="md:col-span-4 bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between min-h-[180px]">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Curated Learning</h3>
                <p className="text-slate-500 text-sm font-medium">Courses, YouTube videos, and resources mapped to your skill gaps.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Path */}
      <section id="solutions" className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-24">
            <AnimatedHeading
              as="h2"
              className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter"
              letterDelay={22}
              startDelay={100}
            >
              Your path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Employment</span>
            </AnimatedHeading>
            <p className="text-lg text-slate-500 font-medium">Three steps to go from student to job-ready professional.</p>
          </div>

          <div className="relative">
            {/* Visual Path Connector */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-slate-100 hidden md:block">
              <div className="h-20 w-full bg-blue-600 absolute top-0 animate-pulse"></div>
            </div>

            <div className="space-y-16 sm:space-y-32">
              <StepRow 
                number="01" 
                title="Assess & Analyze" 
                desc="Take AI-powered skill assessments and upload your resume. We map exactly where you stand."
                align="left"
                icon={<Search size={32} />}
              />
              <StepRow 
                number="02" 
                title="Learn & Build" 
                desc="Get AI-curated courses and resources. Practice with mock interviews. Only learn what matters."
                align="right"
                icon={<PlayCircle size={32} />}
              />
              <StepRow 
                number="03" 
                title="Apply & Land" 
                desc="Browse real job listings matched to your profile. Apply with confidence backed by data."
                align="left"
                icon={<TrendingUp size={32} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights CTA */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0f172a] rounded-2xl sm:rounded-[4rem] p-6 sm:p-12 md:p-24 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)]">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[160px] opacity-20"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <AnimatedHeading
                  as="h2"
                  className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-none"
                  letterDelay={25}
                  startDelay={150}
                >
                  Ready to start your story?
                </AnimatedHeading>
                <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed mb-6 sm:mb-10 max-w-md">
                  Join students and professionals building their careers with SkillTrack AI. Free to get started.
                </p>
                <Link to="/signup" className="inline-flex items-center gap-3 sm:gap-4 bg-white text-slate-900 px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-[2rem] font-black text-base sm:text-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-2xl active:scale-95">
                  Get Free Access <ArrowRight />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FeatureCard icon={<Target size={24} />} label="Skill Assessments" desc="AI-generated quizzes" />
                  <FeatureCard icon={<FileText size={24} />} label="Resume Analysis" desc="PDF parsing + insights" tall />
                </div>
                <div className="space-y-4 pt-12">
                  <FeatureCard icon={<BrainCircuit size={24} />} label="Mock Interviews" desc="Role-specific AI practice" tall highlight />
                  <FeatureCard icon={<Briefcase size={24} />} label="Job Matching" desc="Real listings, skill-matched" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white py-12 sm:py-24 px-4 sm:px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-16">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 text-white font-black p-1.5 rounded-xl">ST</div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">SkillTrack</span>
            </div>
            <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">An AI-powered career companion that helps you assess skills, bridge gaps, and land your dream role.</p>
            <div className="flex gap-6 mt-10">
              <a href="#features" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"><Sparkles size={18} /></a>
              <a href="#solutions" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"><Zap size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.3em]">Platform</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link to="/assessment" className="hover:text-blue-600 transition-colors">Skill Tests</Link></li>
              <li><Link to="/resume" className="hover:text-blue-600 transition-colors">Resume AI</Link></li>
              <li><Link to="/jobs" className="hover:text-blue-600 transition-colors">Job Board</Link></li>
              <li><Link to="/mock" className="hover:text-blue-600 transition-colors">Mock Interviews</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.3em]">Resources</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Career Paths</Link></li>
              <li><Link to="/gaps" className="hover:text-blue-600 transition-colors">Skill Gap Analysis</Link></li>
              <li><Link to="/learning" className="hover:text-blue-600 transition-colors">Learning Hub</Link></li>
              <li><Link to="/profile" className="hover:text-blue-600 transition-colors">Your Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} SkillTrack AI. College Project.</p>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>React + Gemini AI + Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================

const StepRow = ({ number, title, desc, align, icon }: { number: string, title: string, desc: string, align: 'left' | 'right', icon: React.ReactNode }) => (
  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-1 space-y-4 sm:space-y-6 md:text-left text-center">
      <div className="text-4xl sm:text-6xl font-black text-blue-600/10 tracking-tighter mb-2 sm:mb-4">{number}</div>
      <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">{desc}</p>
    </div>
    
    <div className="relative flex-1 flex justify-center items-center">
      <div className="w-40 h-40 sm:w-64 sm:h-64 bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl border border-slate-100 flex items-center justify-center text-blue-600 relative z-10 animate-float">
        {icon}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 sm:w-80 h-52 sm:h-80 bg-blue-50/50 rounded-full blur-3xl -z-0"></div>
    </div>
  </div>
);

const FeatureCard = ({ icon, label, desc, tall, highlight }: { icon: React.ReactNode; label: string; desc: string; tall?: boolean; highlight?: boolean }) => (
  <div className={`${tall ? 'h-44 sm:h-56' : 'h-32 sm:h-40'} ${
    highlight
      ? 'bg-blue-600 shadow-2xl shadow-blue-600/30'
      : 'bg-white/5 backdrop-blur border border-white/10'
  } rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-4 sm:p-6 text-center`}>
    <div className={`mb-3 ${highlight ? 'text-white' : 'text-blue-400'}`}>{icon}</div>
    <p className={`text-sm sm:text-base font-black ${highlight ? 'text-white' : 'text-white'}`}>{label}</p>
    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 ${
      highlight ? 'text-blue-200' : 'text-slate-400'
    }`}>{desc}</p>
  </div>
);

export default Landing;
