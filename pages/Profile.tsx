import React, { useState, useEffect } from 'react';
import {
  Mail,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Plus,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Edit3,
  Save,
  Globe,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import type { ExperienceItem, EducationItem } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    github_url: '',
    linkedin_url: '',
    target_role: '',
    skills: [] as string[],
    experience: [] as ExperienceItem[],
    education: [] as EducationItem[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        target_role: profile.target_role || '',
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
      setShowAddSkill(false);
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', org: '', period: '' }],
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { title: '', org: '', period: '' }],
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...formData.experience];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...formData.education];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeExperience = (index: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
  };

  const removeEducation = (index: number) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };

  const displayName = formData.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero / Header Section */}
      <div className="relative">
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative sm:absolute sm:-bottom-16 sm:left-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:mt-0 px-4 sm:px-0">
          <div className="relative">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl sm:rounded-3xl border-4 border-white overflow-hidden shadow-xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl sm:text-4xl font-bold">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
          <div className="mb-0 sm:mb-4 space-y-1 text-center sm:text-left min-w-0">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="text-2xl sm:text-3xl font-bold bg-white/90 sm:bg-white/20 text-slate-900 sm:text-white sm:placeholder-white/50 placeholder-slate-400 border border-slate-200 sm:border-white/30 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full max-w-xs sm:max-w-sm backdrop-blur-md"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 sm:text-white sm:drop-shadow-sm">{displayName}</h1>
              )}
            </div>
            <p className="text-slate-500 sm:text-blue-50 font-medium text-sm sm:text-base">{formData.target_role || 'Set your target role in edit mode'}</p>
          </div>
        </div>
        <div className="flex justify-center sm:absolute sm:bottom-4 sm:right-8 mt-4 sm:mt-0">
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-blue-600 sm:bg-white/10 sm:backdrop-blur-md border border-blue-600 sm:border-white/20 text-white rounded-xl font-bold hover:bg-blue-700 sm:hover:bg-white/20 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {isSaving ? (
              <><Loader2 size={18} className="animate-spin" /> Saving...</>
            ) : isEditing ? (
              <><Save size={18} /> Save Profile</>
            ) : (
              <><Edit3 size={18} /> Edit Profile</>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-24">
        {/* Left Column: Personal Info & Socials */}
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Contact Information</h3>
            <div className="space-y-4">
              {isEditing ? (
                <EditableField icon={<Edit3 size={18} />} label="Full Name" value={formData.full_name} onChange={(v) => setFormData({ ...formData, full_name: v })} placeholder="Enter your full name" />
              ) : (
                <ContactItem icon={<Edit3 size={18} />} label="Full Name" value={formData.full_name || 'Not set'} />
              )}
              <ContactItem icon={<Mail size={18} />} label="Email" value={user?.email || ''} />
              {isEditing ? (
                <>
                  <EditableField icon={<MapPin size={18} />} label="Location" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="e.g., New Delhi, India" />
                  <EditableField icon={<Globe size={18} />} label="Website" value={formData.website} onChange={(v) => setFormData({ ...formData, website: v })} placeholder="e.g., yoursite.com" />
                </>
              ) : (
                <>
                  <ContactItem icon={<MapPin size={18} />} label="Location" value={formData.location || 'Not set'} />
                  <ContactItem icon={<Globe size={18} />} label="Website" value={formData.website || 'Not set'} />
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Social Profiles</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Github size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="GitHub URL"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="LinkedIn URL"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  {formData.github_url && <SocialLink icon={<Github size={20} />} href={formData.github_url} />}
                  {formData.linkedin_url && <SocialLink icon={<Linkedin size={20} />} href={formData.linkedin_url} />}
                  {!formData.github_url && !formData.linkedin_url && (
                    <p className="text-sm text-slate-400">No social links added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Target Role */}
          <div className="bg-[#0f172a] p-6 rounded-3xl text-white">
            <h3 className="font-bold mb-4">Target Role</h3>
            {isEditing ? (
              <input
                type="text"
                value={formData.target_role}
                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            ) : (
              <p className="text-blue-400 font-bold text-lg">{formData.target_role || 'Not set yet'}</p>
            )}
            <p className="text-slate-400 text-xs leading-relaxed mt-3">Your target role is used to personalize career recommendations, skill gap analysis, and job matches.</p>
          </div>
        </div>

        {/* Right Column: Bio, Skills, Experience */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">About Me</h3>
            {isEditing ? (
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-32 font-medium"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your interests, and career goals..."
              />
            ) : (
              <p className="text-slate-600 leading-relaxed font-medium">
                {formData.bio || 'No bio added yet. Click Edit Profile to add one.'}
              </p>
            )}
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Expertise & Skills</h3>
              {isEditing && (
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            {showAddSkill && isEditing && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g., React.js)"
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
                <button onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Add</button>
                <button onClick={() => setShowAddSkill(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {formData.skills.length === 0 ? (
                <p className="text-slate-400 text-sm">No skills added yet. {isEditing ? 'Click + to add skills.' : 'Edit your profile to add skills.'}</p>
              ) : (
                formData.skills.map((skill) => (
                  <div
                    key={skill}
                    className="group flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-default"
                  >
                    <CheckCircle2 size={16} className="text-blue-500" />
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="ml-1 text-slate-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl"><Briefcase className="text-blue-600" /></div>
                  <h3 className="text-lg font-bold text-slate-900">Experience</h3>
                </div>
                {isEditing && (
                  <button onClick={addExperience} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Plus size={18} /></button>
                )}
              </div>
              <div className="space-y-6">
                {formData.experience.length === 0 ? (
                  <p className="text-slate-400 text-sm">No experience added yet.</p>
                ) : (
                  formData.experience.map((item, idx) => (
                    <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-[-24px] before:w-[2px] last:before:hidden before:bg-slate-100">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="text" value={item.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} placeholder="Job Title" className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                            <button onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                          </div>
                          <input type="text" value={item.org} onChange={(e) => updateExperience(idx, 'org', e.target.value)} placeholder="Company" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          <input type="text" value={item.period} onChange={(e) => updateExperience(idx, 'period', e.target.value)} placeholder="e.g., Jun 2024 - Aug 2024" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <p className="text-slate-500 text-xs font-medium">{item.org}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{item.period}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl"><GraduationCap className="text-purple-600" /></div>
                  <h3 className="text-lg font-bold text-slate-900">Education</h3>
                </div>
                {isEditing && (
                  <button onClick={addEducation} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Plus size={18} /></button>
                )}
              </div>
              <div className="space-y-6">
                {formData.education.length === 0 ? (
                  <p className="text-slate-400 text-sm">No education added yet.</p>
                ) : (
                  formData.education.map((item, idx) => (
                    <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-[-24px] before:w-[2px] last:before:hidden before:bg-slate-100">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-purple-50"></div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="text" value={item.title} onChange={(e) => updateEducation(idx, 'title', e.target.value)} placeholder="Degree/Certificate" className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                            <button onClick={() => removeEducation(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                          </div>
                          <input type="text" value={item.org} onChange={(e) => updateEducation(idx, 'org', e.target.value)} placeholder="Institution" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          <input type="text" value={item.period} onChange={(e) => updateEducation(idx, 'period', e.target.value)} placeholder="e.g., 2021 - 2025" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <p className="text-slate-500 text-xs font-medium">{item.org}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{item.period}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-xl transition-all">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const EditableField = ({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
      />
    </div>
  </div>
);

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
    {icon}
  </a>
);

export default Profile;
