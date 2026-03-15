import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText as aiGenerateText, generateObject } from "ai";
import { z } from "zod";

// Proxy to avoid CORS issues:
// - Dev: Vite dev proxy forwards /api/gemini-proxy -> https://kotproxy.lewds.dev/google/v1beta
// - Production: Vercel serverless function at /api/gemini-proxy does the same
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: '/api/gemini-proxy',
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';

// ==========================================
// 1. RESUME ANALYSIS (with full profile extraction)
// ==========================================
export const analyzeResume = async (text: string) => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Analyze the following resume text thoroughly. Extract ALL information including the candidate's personal details, education history, work experience, social profiles, and provide a comprehensive quality analysis.\n\nResume text:\n${text}`,
      system: `You are a professional resume analyst and career coach. Your job is to:
1. Extract the candidate's full name, email, phone, location, and any URLs (LinkedIn, GitHub, portfolio/website, etc.)
2. Extract ALL education entries with degree/title, institution name, and time period
3. Extract ALL work experience entries with job title, company/organization, and time period
4. Extract ALL technical and soft skills mentioned
5. Provide a professional summary, career path suggestions, improvement areas, and strengths
6. Score the resume quality from 0-100

Be thorough - extract every piece of information available. For URLs, look for linkedin.com, github.com, or any personal website links.`,
      schema: z.object({
        score: z.number().describe('Resume quality score from 0-100'),
        summary: z.string().describe('Professional summary of the candidate'),
        skills: z.array(z.string()).describe('All skills extracted from resume'),
        careerPaths: z.array(z.string()).describe('3-5 recommended career roles'),
        improvements: z.array(z.string()).describe('Actionable resume improvements'),
        strengths: z.array(z.string()).describe('Key strengths identified'),
        // Profile extraction fields
        fullName: z.string().describe('Full name of the candidate, empty string if not found'),
        email: z.string().describe('Email address, empty string if not found'),
        phone: z.string().describe('Phone number, empty string if not found'),
        location: z.string().describe('City/location, empty string if not found'),
        linkedinUrl: z.string().describe('LinkedIn profile URL, empty string if not found'),
        githubUrl: z.string().describe('GitHub profile URL, empty string if not found'),
        websiteUrl: z.string().describe('Personal website or portfolio URL, empty string if not found'),
        bio: z.string().describe('A professional bio/objective extracted or synthesized from the resume, 2-3 sentences'),
        targetRole: z.string().describe('Best matching target role based on resume content'),
        experience: z.array(z.object({
          title: z.string().describe('Job title or role'),
          org: z.string().describe('Company or organization name'),
          period: z.string().describe('Time period e.g. "Jun 2023 - Present"'),
        })).describe('All work experience entries'),
        education: z.array(z.object({
          title: z.string().describe('Degree, certificate or course name'),
          org: z.string().describe('Institution or university name'),
          period: z.string().describe('Time period e.g. "2020 - 2024"'),
        })).describe('All education entries'),
      }),
    });
    return object;
  } catch (error) {
    console.error("Resume analysis error:", error);
    return null;
  }
};

// ==========================================
// 2. SKILL ASSESSMENT - Generate Questions
// ==========================================
export const generateAssessmentQuestions = async (topic: string, difficulty: string = 'medium', count: number = 10) => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Generate ${count} multiple-choice questions for a ${difficulty} difficulty skill assessment on the topic: "${topic}". Each question should have exactly 4 options with one correct answer. Include an explanation for each correct answer.`,
      system: "You are a technical assessment expert. Generate high-quality MCQ questions that test real-world understanding.",
      schema: z.object({
        questions: z.array(z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()).length(4),
          correctAnswer: z.number().describe('0-3 index of the correct option'),
          explanation: z.string(),
        })),
      }),
    });
    return object?.questions || null;
  } catch (error) {
    console.error("Assessment generation error:", error);
    return null;
  }
};

// ==========================================
// 3. CAREER RECOMMENDATIONS
// ==========================================
export const getCareerRecommendations = async (skills: string[], experience: string, interests: string) => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Based on the following profile, recommend the best career paths:\n\nSkills: ${skills.join(', ')}\nExperience: ${experience}\nInterests/Goals: ${interests}\n\nProvide detailed career recommendations with match percentages, required skills, salary ranges, and a brief roadmap for each.`,
      system: "You are a career counselor with deep knowledge of tech industry roles and career progression.",
      schema: z.object({
        careers: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          matchPercentage: z.number().describe('0-100 match score'),
          requiredSkills: z.array(z.string()),
          salaryRange: z.string(),
          roadmap: z.array(z.string()).describe('3-5 step roadmap'),
        })),
      }),
    });
    return object?.careers || null;
  } catch (error) {
    console.error("Career recommendations error:", error);
    return null;
  }
};

// ==========================================
// 4. JOB RECOMMENDATIONS
// ==========================================
export const getJobRecommendations = async (skills: string[], targetRole: string, location: string = 'Remote') => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Generate realistic job listings matching:\n\nSkills: ${skills.join(', ')}\nTarget Role: ${targetRole}\nPreferred Location: ${location}\n\nGenerate 6-8 realistic job postings from real companies with match percentages.`,
      system: "You are a job matching engine. Generate realistic job postings that match the candidate's profile.",
      schema: z.object({
        jobs: z.array(z.object({
          id: z.string(),
          title: z.string(),
          company: z.string(),
          location: z.string(),
          salary: z.string(),
          type: z.string().describe('Full-time, Part-time, Contract, or Internship'),
          matchPercentage: z.number(),
          skills: z.array(z.string()),
          description: z.string().describe('2-3 sentence job description'),
          applyUrl: z.string(),
        })),
      }),
    });
    return object?.jobs || null;
  } catch (error) {
    console.error("Job recommendations error:", error);
    return null;
  }
};

// ==========================================
// 5. SKILL GAP ANALYSIS
// ==========================================
export const analyzeSkillGaps = async (currentSkills: string[], targetRole: string) => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Analyze skill gaps for a candidate targeting "${targetRole}".\n\nCurrent skills: ${currentSkills.join(', ')}\n\nCompare current skill levels vs industry requirements. Include skills they have and skills they're missing.`,
      system: "You are a technical skills analyst. Provide realistic assessments of skill levels and gaps.",
      schema: z.object({
        targetRole: z.string(),
        readinessScore: z.number().describe('0-100 readiness score'),
        gaps: z.array(z.object({
          skill: z.string(),
          currentLevel: z.number().describe('0-100 current proficiency'),
          requiredLevel: z.number().describe('0-100 required proficiency'),
          recommendation: z.string(),
        })),
      }),
    });
    return object;
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return null;
  }
};

// ==========================================
// 6. LEARNING RECOMMENDATIONS
// ==========================================
export const getLearningRecommendations = async (skillGaps: string[], targetRole: string) => {
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Recommend real courses and YouTube videos for a candidate targeting "${targetRole}" who needs to improve in: ${skillGaps.join(', ')}.\n\nRecommend courses from Coursera, Udemy, LinkedIn Learning, edX, freeCodeCamp, etc.\n\nAlso recommend 6-8 real, existing YouTube videos/playlists that are highly rated and relevant. Include actual YouTube channel names and realistic video durations. The links should be real YouTube URLs (youtube.com/watch?v=... or youtube.com/playlist?list=...).`,
      system: "You are an education consultant. Recommend real, existing courses, resources, and YouTube videos. For YouTube recommendations, only suggest videos/playlists from well-known tech educators (e.g., Fireship, Traversy Media, freeCodeCamp, The Net Ninja, Corey Schafer, Tech With Tim, CS Dojo, etc.).",
      schema: z.object({
        courses: z.array(z.object({
          id: z.string(),
          title: z.string(),
          platform: z.string(),
          duration: z.string(),
          difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
          link: z.string(),
          description: z.string(),
          relevance: z.string(),
        })),
        freeResources: z.array(z.object({
          title: z.string(),
          type: z.string(),
          link: z.string(),
        })),
        youtubeVideos: z.array(z.object({
          title: z.string().describe('Video or playlist title'),
          channel: z.string().describe('YouTube channel name'),
          link: z.string().describe('Full YouTube URL'),
          duration: z.string().describe('Video duration e.g. "12:34" or "2h 15m" for playlists'),
          description: z.string().describe('Brief 1-sentence description of what the video covers'),
        })),
      }),
    });
    return object;
  } catch (error) {
    console.error("Learning recommendations error:", error);
    return null;
  }
};

// ==========================================
// 7. MOCK INTERVIEW
// ==========================================
export const startInterview = async (role: string) => {
  try {
    const { text } = await aiGenerateText({
      model: google(MODEL),
      prompt: `You are a professional technical interviewer for the role of ${role}. Start the interview by greeting the candidate warmly, briefly explaining the format (you'll ask a mix of technical and behavioral questions), and then ask a strong opening technical question relevant to the ${role} role. Be professional and concise.`,
    });
    return text || "Hello! I'm your AI interviewer. Let's begin. Can you tell me about a complex project you've worked on?";
  } catch (error) {
    console.error("Interview start error:", error);
    return "Hello! I'm your AI interviewer. Let's begin. Can you tell me about a complex project you've worked on?";
  }
};

export const sendInterviewResponse = async (role: string, chatHistory: { role: string; text: string }[], userResponse: string) => {
  const formattedHistory = chatHistory
    .map((h) => `${h.role === 'model' ? 'Interviewer' : 'Candidate'}: ${h.text}`)
    .join('\n');

  try {
    const { text } = await aiGenerateText({
      model: google(MODEL),
      prompt: `You are a technical interviewer for the role of ${role}. Here is the conversation so far:\n\n${formattedHistory}\n\nThe candidate just said: "${userResponse}"\n\nProvide brief, constructive feedback on their answer (what was good, what could be improved), then ask the next question. Vary between technical, behavioral, and situational questions. Keep your response concise (2-4 sentences for feedback + 1 question).`,
    });
    return text || "I appreciate your answer. Let me move on to the next question. Can you describe a time you had to solve a complex technical problem under pressure?";
  } catch (error) {
    console.error("Interview response error:", error);
    return "I appreciate your answer. Let me move on to the next question. Can you describe a time you had to solve a complex technical problem under pressure?";
  }
};

// ==========================================
// 8. INTERVIEW FEEDBACK
// ==========================================
export const generateInterviewFeedback = async (role: string, messages: { role: string; text: string }[]) => {
  const formattedHistory = messages
    .map((h) => `${h.role === 'model' ? 'Interviewer' : 'Candidate'}: ${h.text}`)
    .join('\n');

  try {
    const { object } = await generateObject({
      model: google(MODEL),
      prompt: `Analyze this complete mock interview for the role of ${role} and provide detailed feedback:\n\n${formattedHistory}`,
      system: "You are a senior technical interview coach. Score each area realistically based on the candidate's actual responses.",
      schema: z.object({
        technicalAccuracy: z.number().describe('0-100 score'),
        communicationScore: z.number().describe('0-100 score'),
        problemSolving: z.number().describe('0-100 score'),
        overallScore: z.number().describe('0-100 score'),
        strengths: z.array(z.string()),
        improvements: z.array(z.string()),
        summary: z.string(),
      }),
    });
    return object;
  } catch (error) {
    console.error("Interview feedback error:", error);
    return null;
  }
};

// ==========================================
// 9. CAREER ROADMAP GENERATION
// ==========================================
export const generateCareerRoadmap = async (currentSkills: string[], targetCareer: string) => {
  try {
    const { text } = await aiGenerateText({
      model: google(MODEL),
      prompt: `Create a detailed 6-month career roadmap for someone transitioning to ${targetCareer}.\n\nCurrent skills: ${currentSkills.join(', ')}\n\nProvide a month-by-month plan with specific actions, skills to learn, projects to build, and milestones.`,
    });
    return text || null;
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return null;
  }
};
