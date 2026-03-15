import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, Sparkles, Brain, CheckCircle2, Loader2, UserCheck, ArrowRight } from 'lucide-react';
import { analyzeResume } from '../services/geminiService';
import { useUserData } from '../contexts/UserDataContext';
import type { ResumeAnalysis, ResumeAnalysisExtracted } from '../types';

// PDF text extraction using pdfjs-dist via CDN worker
const extractTextFromPDF = async (file: File): Promise<string> => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
};

const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || '');
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
};

const ResumeUpload: React.FC = () => {
  const { profile, saveResumeAnalysis, updateProfile } = useUserData();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisExtracted | null>(null);
  const [error, setError] = useState('');
  const [extractionStatus, setExtractionStatus] = useState('');
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      setAnalysisResult(null);
      setProfileUpdated(false);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    setProfileUpdated(false);

    try {
      setExtractionStatus('Extracting text from your resume...');
      const text = await extractTextFromFile(file);

      if (!text || text.length < 50) {
        setError('Could not extract enough text from this file. Please ensure your resume has readable text content (not scanned images).');
        setIsAnalyzing(false);
        return;
      }

      setExtractionStatus('AI is analyzing your resume and extracting profile data...');
      const result = await analyzeResume(text);

      if (result) {
        const analysis: ResumeAnalysisExtracted = {
          file_name: file.name,
          resume_text: text.substring(0, 5000),
          score: result.score || 0,
          summary: result.summary || '',
          skills: result.skills || [],
          career_paths: result.careerPaths || [],
          improvements: result.improvements || [],
          strengths: result.strengths || [],
          fullName: result.fullName || '',
          email: result.email || '',
          phone: result.phone || '',
          location: result.location || '',
          linkedinUrl: result.linkedinUrl || '',
          githubUrl: result.githubUrl || '',
          websiteUrl: result.websiteUrl || '',
          bio: result.bio || '',
          targetRole: result.targetRole || '',
          experience: result.experience || [],
          education: result.education || [],
        };

        setAnalysisResult(analysis);

        // Save analysis to Supabase
        const saveData: Omit<ResumeAnalysis, 'id' | 'user_id' | 'created_at'> = {
          file_name: analysis.file_name,
          resume_text: analysis.resume_text,
          score: analysis.score,
          summary: analysis.summary,
          skills: analysis.skills,
          career_paths: analysis.career_paths,
          improvements: analysis.improvements,
          strengths: analysis.strengths,
        };
        await saveResumeAnalysis(saveData);
      } else {
        setError('AI analysis failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      console.error(err);
    }

    setIsAnalyzing(false);
    setExtractionStatus('');
  };

  const fillProfile = async () => {
    if (!analysisResult || !profile) return;
    setIsUpdatingProfile(true);

    // Build profile updates - only fill fields that are empty or merge arrays
    const updates: Record<string, any> = {};

    if (analysisResult.fullName && !profile.full_name) {
      updates.full_name = analysisResult.fullName;
    }
    if (analysisResult.bio) {
      updates.bio = analysisResult.bio;
    }
    if (analysisResult.location && !profile.location) {
      updates.location = analysisResult.location;
    }
    if (analysisResult.websiteUrl && !profile.website) {
      updates.website = analysisResult.websiteUrl;
    }
    if (analysisResult.githubUrl && !profile.github_url) {
      updates.github_url = analysisResult.githubUrl;
    }
    if (analysisResult.linkedinUrl && !profile.linkedin_url) {
      updates.linkedin_url = analysisResult.linkedinUrl;
    }
    if (analysisResult.targetRole) {
      updates.target_role = analysisResult.targetRole;
    }

    // Merge skills
    if (analysisResult.skills.length > 0) {
      const merged = [...new Set([...(profile.skills || []), ...analysisResult.skills])];
      updates.skills = merged;
    }

    // Replace experience and education with extracted data (more complete)
    if (analysisResult.experience.length > 0) {
      updates.experience = analysisResult.experience;
    }
    if (analysisResult.education.length > 0) {
      updates.education = analysisResult.education;
    }

    await updateProfile(updates);
    setProfileUpdated(true);
    setIsUpdatingProfile(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 perspective-1000">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Resume AI Insights</h1>
        <p className="text-slate-500 text-lg mt-1 font-medium">Upload your resume (PDF) to get an AI-powered analysis and auto-fill your profile.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-blue-500 transition-all group cursor-pointer relative overflow-hidden glass-depth shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 preserve-3d">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept=".pdf,.txt"
            />
            <div className="text-center transform transition-transform group-hover:scale-105">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner animate-float">
                <Upload size={36} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Drop your resume here</h3>
              <p className="text-slate-500 font-medium mb-6">Supports PDF, TXT -- Max 5MB</p>
              <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                Browse Files
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {file && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><FileText size={28} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] tracking-tight">{file.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setAnalysisResult(null); setProfileUpdated(false); }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={20} /></button>
            </div>
          )}

          <button
            disabled={!file || isAnalyzing}
            onClick={startAnalysis}
            className={`w-full py-5 rounded-[1.5rem] font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 ${
              !file ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-600/30'
            } active:scale-95`}
          >
            {isAnalyzing ? (
              <><Loader2 size={22} className="animate-spin" /> {extractionStatus}</>
            ) : (
              <>Start Analysis <Sparkles size={22} /></>
            )}
          </button>
        </div>

        <div className="animate-in slide-in-from-right-8 duration-700">
          {!analysisResult && !isAnalyzing ? (
            <div className="bg-slate-50/50 h-full min-h-[400px] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border border-slate-100 glass-depth">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 shadow-xl">
                <Brain size={48} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">AI Insights Terminal</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">Upload a PDF resume to get AI-powered analysis and auto-fill your profile with extracted data.</p>
            </div>
          ) : isAnalyzing ? (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 h-full shadow-2xl glass-depth animate-pulse">
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-5 bg-slate-100 rounded-full w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                  </div>
                </div>
                <div className="h-48 bg-slate-50 rounded-[2rem]"></div>
              </div>
            </div>
          ) : analysisResult && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-2xl glass-depth animate-in zoom-in-95 duration-500 overflow-auto max-h-[80vh]">
              {/* Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Score Analysis</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Profile Health Status</p>
                </div>
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex flex-col items-center justify-center border-4 border-blue-600 shadow-xl shadow-blue-600/10">
                  <span className="text-2xl font-black text-blue-600 leading-none">{analysisResult.score}</span>
                  <span className="text-[10px] font-black text-blue-400 uppercase mt-1">Pts</span>
                </div>
              </div>

              {/* Auto-fill profile button */}
              <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck size={24} />
                    <div>
                      <h4 className="font-bold text-sm">Auto-Fill Profile</h4>
                      <p className="text-blue-100 text-xs">
                        {profileUpdated
                          ? 'Profile updated with resume data!'
                          : `Found: ${analysisResult.fullName ? 'Name, ' : ''}${analysisResult.experience.length} experience, ${analysisResult.education.length} education, ${analysisResult.skills.length} skills`}
                      </p>
                    </div>
                  </div>
                  {!profileUpdated ? (
                    <button
                      onClick={fillProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {isUpdatingProfile ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                      ) : (
                        <>Fill Now <ArrowRight size={16} /></>
                      )}
                    </button>
                  ) : (
                    <CheckCircle2 size={24} className="text-green-300" />
                  )}
                </div>

                {/* Preview what will be filled */}
                {!profileUpdated && (
                  <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs text-blue-100">
                    {analysisResult.fullName && <span>Name: {analysisResult.fullName}</span>}
                    {analysisResult.location && <span>Location: {analysisResult.location}</span>}
                    {analysisResult.linkedinUrl && <span>LinkedIn: Found</span>}
                    {analysisResult.githubUrl && <span>GitHub: Found</span>}
                    {analysisResult.websiteUrl && <span>Website: Found</span>}
                    {analysisResult.targetRole && <span>Target: {analysisResult.targetRole}</span>}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
                <p className="text-sm font-medium text-slate-700 italic leading-relaxed">"{analysisResult.summary}"</p>
              </div>

              {/* Extracted Experience */}
              {analysisResult.experience.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Extracted Experience</h4>
                  <div className="space-y-2">
                    {analysisResult.experience.map((exp, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{exp.title}</p>
                          <p className="text-xs text-slate-500">{exp.org} &middot; {exp.period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Education */}
              {analysisResult.education.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Extracted Education</h4>
                  <div className="space-y-2">
                    {analysisResult.education.map((edu, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{edu.title}</p>
                          <p className="text-xs text-slate-500">{edu.org} &middot; {edu.period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysisResult.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Strengths</h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-green-700 font-medium">
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Career Paths */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Top Roles for You</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.career_paths.map((path) => (
                    <span key={path} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{path}</span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100 flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div> {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Brain size={60} /></div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle size={14} className="text-orange-400" /> Improvement Strategy
                </h4>
                <ul className="space-y-3">
                  {analysisResult.improvements.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-xs font-medium text-slate-300">
                      <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
