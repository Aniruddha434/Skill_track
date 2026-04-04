import type { Job } from '../types';

const JINA_API_KEY = process.env.JINA_API_KEY || '';

interface ScrapedJobRaw {
  title: string;
  company: string;
  location: string;
  link: string;
  salary?: string;
  posted?: string;
  source: string;
}

export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'any';

type JobSource = 'LinkedIn' | 'Naukri' | 'Unstop' | 'Glassdoor' | 'Indeed' | 'Internshala' | 'Wellfound';

interface SearchPlan {
  source: JobSource;
  query: string;
  url: string;
  parser: (md: string) => ScrapedJobRaw[];
  location?: string;
}

// ============================================================
// JINA FETCHER
// ============================================================
async function jinaFetch(url: string): Promise<string> {
  const response = await fetch(`/api/jina-proxy/${url}`, {
    headers: {
      'Authorization': `Bearer ${JINA_API_KEY}`,
      'Accept': 'application/json',
      'X-Return-Format': 'json',
    },
  });
  if (!response.ok) throw new Error(`Jina ${response.status}`);
  const data = await response.json();
  return data?.data?.content || data?.content || '';
}

// ============================================================
// LINKEDIN SCRAPER
// ============================================================
function buildLinkedInUrl(query: string, location: string, level: ExperienceLevel): string {
  const expMap: Record<ExperienceLevel, string> = {
    fresher: '1%2C2', junior: '2%2C3', mid: '3%2C4', senior: '4%2C5', any: '',
  };
  let url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
  if (expMap[level]) url += `&f_E=${expMap[level]}`;
  return url;
}

function parseLinkedIn(md: string): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  // Split on list items that start with [Title](link)
  const chunks = md.split(/\n\*\s+\[/).filter(Boolean);
  for (const chunk of chunks) {
    try {
      const m = chunk.match(/^([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
      if (!m || !m[2].includes('linkedin.com/jobs')) continue;
      const title = m[1].trim();
      const link = m[2].trim();
      const compM = chunk.match(/####\s+\[([^\]]+)\]/);
      const company = compM ? compM[1].trim() : '';
      const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
      let location = '';
      let posted = '';
      for (const line of lines) {
        if (!location && !line.startsWith('#') && !line.startsWith('[') && !line.startsWith('*') &&
            line.length > 3 && line.length < 100 &&
            (line.includes(',') || /India|Remote|Bangalore|Hyderabad|Mumbai|Delhi|Pune|Chennai|Noida|Gurgaon|Kolkata|United States|UK/i.test(line)) &&
            !/ago\s*$/i.test(line)) {
          location = line;
        }
        if (/\d+\s+(day|week|month|hour)s?\s+ago/i.test(line)) posted = line.trim();
      }
      if (title && (company || location)) {
        jobs.push({ title, company, location, link, posted, source: 'LinkedIn' });
      }
    } catch { continue; }
  }
  // Fallback: heading-based parse
  if (jobs.length < 2) {
    const lines = md.split('\n');
    let t = '', l = '', c = '', lk = '';
    for (const line of lines) {
      const h3 = line.match(/^###\s+(?:\[([^\]]+)\]\(([^)]+)\)|(.+))/);
      if (h3 && !line.startsWith('####')) {
        if (t && (c || l)) jobs.push({ title: t, company: c, location: l, link: lk, source: 'LinkedIn' });
        t = (h3[1] || h3[3] || '').trim(); lk = h3[2] || ''; c = ''; l = '';
        continue;
      }
      const h4 = line.match(/^####\s+\[?([^\]\n]+)\]?/);
      if (h4) { c = h4[1].replace(/\([^)]+\)/, '').trim(); continue; }
      const linkM = line.match(/\((https?:\/\/[^)]*linkedin\.com\/jobs\/view[^)]+)\)/);
      if (linkM) lk = linkM[1];
      if (t && !l && !line.startsWith('#') && line.length > 3 && line.length < 80 &&
          (line.includes(',') || /remote|india/i.test(line))) l = line.trim();
    }
    if (t && (c || l)) jobs.push({ title: t, company: c, location: l, link: lk, source: 'LinkedIn' });
  }
  return jobs;
}

// ============================================================
// NAUKRI SCRAPER
// ============================================================
function buildNaukriUrl(query: string, level: ExperienceLevel): string {
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
  const expMap: Record<ExperienceLevel, string> = {
    fresher: '0', junior: '1', mid: '3', senior: '6', any: '',
  };
  let url = `https://www.naukri.com/${slug}-jobs`;
  const exp = expMap[level];
  if (exp) url += `?experience=${exp}`;
  return url;
}

function parseNaukri(md: string): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  // Naukri listings in Jina often appear as links with job info nearby
  // Pattern: [Job Title](naukri-link) followed by company, location, salary lines
  const linkPattern = /\[([^\]]{5,})\]\((https?:\/\/www\.naukri\.com\/job-listings-[^\)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(md)) !== null) {
    const title = match[1].trim();
    const link = match[2].trim();
    // Get context: next 500 chars after this match
    const context = md.substring(match.index, match.index + 600);
    const lines = context.split('\n').map(l => l.trim()).filter(Boolean);
    let company = '', location = '', salary = '';
    for (const line of lines) {
      if (!company && !line.startsWith('[') && !line.startsWith('#') && !line.includes('http') &&
          line.length > 2 && line.length < 60 && !/\d+\s*(day|week|month|hour)/i.test(line) &&
          !/\d+\s*-\s*\d+\s*(lpa|lac|lakh|k)/i.test(line)) {
        company = line;
      }
      if (!salary && /(\d[\d,.]+\s*-\s*\d[\d,.]+\s*(lpa|lac|lakh|l|k|lakhs))/i.test(line)) {
        const sm = line.match(/(\d[\d,.]+\s*-\s*\d[\d,.]+\s*(lpa|lac|lakh|l|k|lakhs)[^\n]*)/i);
        if (sm) salary = sm[1].trim();
      }
      if (!location && /Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Pune|Chennai|Noida|Gurgaon|Kolkata|Remote|India/i.test(line) &&
          line.length < 80) {
        location = line.replace(/[*_#]/g, '').trim();
      }
    }
    if (title) jobs.push({ title, company, location, link, salary, source: 'Naukri' });
  }

  // Fallback: look for article-like blocks with job titles as headings
  if (jobs.length < 2) {
    const headingPattern = /###?\s+\[?([^\]\n[]{5,})\]?(?:\(([^)]+naukri[^)]+)\))?/g;
    let hm;
    while ((hm = headingPattern.exec(md)) !== null) {
      const title = hm[1].trim();
      const link = hm[2] || '';
      if (title.length > 100 || /naukri\.com|search|filter|popular/i.test(title)) continue;
      if (/developer|engineer|designer|analyst|manager|intern|trainee/i.test(title)) {
        jobs.push({ title, company: '', location: '', link: link.includes('naukri') ? link : '', source: 'Naukri' });
      }
    }
  }
  return jobs;
}

// ============================================================
// UNSTOP SCRAPER
// ============================================================
function buildUnstopUrl(query: string): string {
  return `https://unstop.com/jobs?oppstatus=recent&keyword=${encodeURIComponent(query)}`;
}

function parseUnstop(md: string): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  // Unstop format from Jina: [### Title Company **exp** Full Time Location Skills ...](link)
  const pattern = /\[###\s+([^\n]+?)(?:\s+\*\*.*?\*\*[^]*?)\]\((https:\/\/unstop\.com\/jobs\/[^\)]+)\)/g;
  let m;
  while ((m = pattern.exec(md)) !== null) {
    const title = m[1].trim();
    const link = m[2].trim();
    // Parse the block for company, location, salary
    const block = m[0];
    const lines = block.split(/\s{2,}|\n/).map(l => l.trim()).filter(Boolean);
    let company = '', location = '', salary = '';
    for (const line of lines) {
      if (!company && !line.startsWith('[') && !line.startsWith('#') && !line.startsWith('*') &&
          line.length > 2 && line.length < 50 && !/Full Time|Part Time|Work from|In Office|Hybrid/i.test(line) &&
          !/\d\s*K|Month|year/i.test(line) && !/(Skills|Posted|days? left)/i.test(line)) {
        company = line;
      }
      if (/In Office\s*\|\s*(.+)/i.test(line)) {
        const lm = line.match(/In Office\s*\|\s*([^*\n]+)/i);
        if (lm) location = lm[1].trim();
      }
      if (/Hybrid\s*\|\s*(.+)/i.test(line)) {
        const lm = line.match(/Hybrid\s*\|\s*([^*\n]+)/i);
        if (lm) location = lm[1].trim();
      }
      if (/Work from Home/i.test(line)) location = location || 'Remote (Work from Home)';
      if (/\*\*(\d[\d,.]+\s*K?\s*-\s*\d[\d,.]+\s*K?\/Month)\*\*/i.test(line)) {
        const sm = line.match(/\*\*([^*]+\/Month)\*\*/i);
        if (sm) salary = sm[1].trim();
      }
    }
    if (title) jobs.push({ title, company, location, link, salary, source: 'Unstop' });
  }

  // Broader fallback: extract any unstop.com/jobs links with context
  if (jobs.length < 2) {
    const linkPat = /\[([^\]]{3,80})\]\((https:\/\/unstop\.com\/jobs\/[^\)]+)\)/g;
    let lm;
    while ((lm = linkPat.exec(md)) !== null) {
      const title = lm[1].replace(/^###?\s*/, '').trim();
      const link = lm[2].trim();
      if (title.length < 5 || /image|icon|logo|prize/i.test(title)) continue;
      if (!jobs.some(j => j.link === link)) {
        jobs.push({ title, company: '', location: '', link, source: 'Unstop' });
      }
    }
  }
  return jobs;
}

// ============================================================
// GLASSDOOR SCRAPER
// ============================================================
function buildGlassdoorUrl(query: string, level: ExperienceLevel): string {
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'');
  const levelSuffix = (level === 'fresher' || level === 'junior') ? '-fresher' : '';
  return `https://www.glassdoor.co.in/Job/india-${slug}${levelSuffix}-jobs-SRCH_IL.0,5_IN115.htm`;
}

function parseGlassdoor(md: string): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  // Glassdoor format: [Job Title](glassdoor-link) followed by company, location, salary
  const pattern = /\[([^\]]{5,})\]\((https?:\/\/www\.glassdoor\.co\.in\/job-listing\/[^\)]+)\)/g;
  let m;
  while ((m = pattern.exec(md)) !== null) {
    const title = m[1].trim();
    const link = m[2].trim();
    // Get surrounding context
    const ctxStart = Math.max(0, m.index - 200);
    const context = md.substring(ctxStart, m.index + 500);
    let company = '', location = '', salary = '';
    // Company often appears before the title link as text or in a different pattern
    const compBefore = context.substring(0, m.index - ctxStart);
    const compM = compBefore.match(/([A-Z][A-Za-z0-9 &.'-]+?)(?:\s+[\d.]+)?\s*$/);
    if (compM) company = compM[1].trim();
    // After the link
    const after = md.substring(m.index + m[0].length, m.index + m[0].length + 300);
    const aLines = after.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of aLines) {
      if (!location && /Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Pune|Chennai|Noida|Gurgaon|Kolkata|India|Remote/i.test(line) && line.length < 60) {
        location = line.replace(/[^A-Za-z, ]/g, '').trim();
      }
      if (!salary && /₹|lpa|lac|lakh/i.test(line)) {
        const sm = line.match(/(₹[\d,.]+\s*[LKM]?\s*-\s*₹[\d,.]+\s*[LKM]?)/i) || line.match(/([\d,.]+\s*-\s*[\d,.]+\s*(lpa|lac|lakh)[^\n]*)/i);
        if (sm) salary = sm[1].trim();
      }
    }
    if (title && !/Sign in|Search|Skip|Upload/i.test(title)) {
      jobs.push({ title, company, location, link, salary, source: 'Glassdoor' });
    }
  }
  return jobs;
}

// ============================================================
// INDEED SCRAPER
// ============================================================
function buildIndeedUrl(query: string, location: string): string {
  return `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
}

// ============================================================
// INTERNSHALA SCRAPER
// ============================================================
function buildInternshalaUrl(query: string): string {
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `https://internshala.com/jobs/keywords-${slug}`;
}

// ============================================================
// WELLFOUND SCRAPER
// ============================================================
function buildWellfoundUrl(query: string, location: string): string {
  return `https://wellfound.com/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
}

// ============================================================
// UTILS
// ============================================================
const KNOWN_SKILLS = [
  'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL',
  'Machine Learning', 'AI', 'DevOps', 'Frontend', 'Backend', 'Full Stack', 'iOS', 'Android',
  'Flutter', 'Swift', 'Kotlin', 'Go', 'Rust', 'C++', 'C#', '.NET', 'Spring', 'Django',
  'Next.js', 'GraphQL', 'REST', 'Microservices', 'Data Science', 'Deep Learning',
  'HTML', 'CSS', 'MERN', 'Express', 'Tailwind', 'Redux', 'Git', 'Linux', 'PHP', 'Laravel',
  'Ruby', 'Figma', 'Selenium', 'Jenkins', 'Terraform', 'Power BI', 'Tableau', 'Excel',
];

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function isLikelyJobTitle(title: string): boolean {
  const cleaned = title.trim();
  if (cleaned.length < 4 || cleaned.length > 120) return false;
  if (/sign in|search|filter|sort|upload|salary guide|home page|privacy|terms/i.test(cleaned)) return false;

  return /developer|engineer|designer|analyst|manager|intern|trainee|scientist|consultant|specialist|architect|administrator|associate|lead|qa|tester|product|devops|security/i.test(cleaned);
}

function splitContextLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.replace(/[*_#>`|]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function extractLocationFromLines(lines: string[]): string {
  for (const line of lines) {
    if (
      line.length < 100 &&
      /remote|hybrid|onsite|work from home|bangalore|bengaluru|hyderabad|mumbai|pune|chennai|noida|gurgaon|gurugram|delhi|kolkata|india|united states|uk|europe|singapore/i.test(line)
    ) {
      return line;
    }
  }
  return '';
}

function extractSalaryFromLines(lines: string[]): string {
  for (const line of lines) {
    if (/₹|\$|€|£|lpa|lac|lakh|per year|per month|\/year|\/month|a year|a month/i.test(line) && line.length < 120) {
      return line;
    }
  }
  return '';
}

function extractPostedFromLines(lines: string[]): string {
  for (const line of lines) {
    if (/\d+\+?\s*(day|week|month|hour)s?\s+ago|today|just posted|posted/i.test(line)) {
      return line;
    }
  }
  return '';
}

function extractCompanyFromLines(lines: string[], title: string): string {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const line of lines) {
    const normalizedLine = line.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normalizedLine || normalizedLine === normalizedTitle) continue;
    if (line.length < 2 || line.length > 80) continue;
    if (/remote|hybrid|onsite|work from home|today|ago|posted|apply|save|easy apply|salary|year|month|full[- ]time|part[- ]time|contract|internship/i.test(line)) continue;
    if (/developer|engineer|designer|analyst|manager|intern|scientist|architect|consultant/i.test(line)) continue;
    if (!/[a-z]/i.test(line)) continue;
    return line;
  }

  return '';
}

function parseJobsFromLinkMatches(md: string, source: JobSource, linkPattern: RegExp): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  const seenLinks = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(md)) !== null) {
    const title = match[1].trim();
    const link = match[2].trim();

    if (!isLikelyJobTitle(title) || seenLinks.has(link)) continue;
    seenLinks.add(link);

    const start = Math.max(0, match.index - 180);
    const end = Math.min(md.length, match.index + match[0].length + 500);
    const lines = splitContextLines(md.substring(start, end));

    const company = extractCompanyFromLines(lines, title);
    const location = extractLocationFromLines(lines);
    const salary = extractSalaryFromLines(lines);
    const posted = extractPostedFromLines(lines);

    jobs.push({ title, company, location, link, salary, posted, source });
  }

  return jobs;
}

function parseIndeed(md: string): ScrapedJobRaw[] {
  return parseJobsFromLinkMatches(md, 'Indeed', /\[([^\]]{4,120})\]\((https?:\/\/(?:[a-z]+\.)?indeed\.com\/[^)]+)\)/g);
}

function parseInternshala(md: string): ScrapedJobRaw[] {
  return parseJobsFromLinkMatches(md, 'Internshala', /\[([^\]]{4,120})\]\((https?:\/\/internshala\.com\/(?:job|internship)\/detail\/[^)]+)\)/g);
}

function parseWellfound(md: string): ScrapedJobRaw[] {
  return parseJobsFromLinkMatches(md, 'Wellfound', /\[([^\]]{4,120})\]\((https?:\/\/wellfound\.com\/jobs\/[^)]+)\)/g);
}

function buildSearchQueries(skills: string[], targetRole: string, experienceLevel: ExperienceLevel): string[] {
  const baseRole = targetRole.trim() || (skills.length > 0 ? `${skills[0]} Developer` : 'Software Developer');
  const lcRole = baseRole.toLowerCase();
  const queries = [
    baseRole,
    /developer|engineer|designer|analyst|manager|intern/i.test(baseRole) ? baseRole : `${baseRole} developer`,
    /engineer/i.test(baseRole) ? baseRole : `${baseRole} engineer`,
    ...skills.slice(0, 3).map(skill =>
      /developer|engineer|designer|analyst|manager/i.test(skill) ? skill : `${skill} developer`
    ),
  ];

  if (/frontend/i.test(lcRole)) {
    queries.push('React Developer', 'Frontend Engineer');
  }
  if (/backend/i.test(lcRole)) {
    queries.push('Backend Engineer', 'Node.js Developer');
  }
  if (/full\s*stack/i.test(lcRole)) {
    queries.push('Full Stack Developer', 'Software Engineer');
  }
  if (/data/i.test(lcRole)) {
    queries.push('Data Analyst', 'Data Scientist');
  }

  if (experienceLevel === 'fresher' || experienceLevel === 'junior') {
    queries.push(`${baseRole} intern`, `${baseRole} internship`, `${baseRole} trainee`);
  }

  return uniqueStrings(queries).slice(0, 6);
}

function buildLocationVariants(location: string): string[] {
  const normalized = location.trim() || 'India';
  const parts = normalized.split(',').map(part => part.trim()).filter(Boolean);
  const variants = [normalized];

  if (parts.length > 1) variants.push(parts[0]);
  if (!/remote/i.test(normalized)) variants.push('Remote');
  if (!/india/i.test(normalized)) variants.push('India');

  return uniqueStrings(variants).slice(0, 3);
}

function buildSearchPlans(
  skills: string[],
  targetRole: string,
  location: string,
  experienceLevel: ExperienceLevel,
): SearchPlan[] {
  const queries = buildSearchQueries(skills, targetRole, experienceLevel);
  const locations = buildLocationVariants(location);
  const plans: SearchPlan[] = [];

  for (const query of queries.slice(0, 4)) {
    for (const loc of locations.slice(0, 2)) {
      plans.push({
        source: 'LinkedIn',
        query,
        location: loc,
        url: buildLinkedInUrl(query, loc, experienceLevel),
        parser: parseLinkedIn,
      });
    }
  }

  for (const query of queries.slice(0, 4)) {
    plans.push({
      source: 'Naukri',
      query,
      url: buildNaukriUrl(query, experienceLevel),
      parser: parseNaukri,
    });
  }

  for (const query of queries.slice(0, 4)) {
    plans.push({
      source: 'Unstop',
      query,
      url: buildUnstopUrl(query),
      parser: parseUnstop,
    });
  }

  for (const query of queries.slice(0, 3)) {
    plans.push({
      source: 'Glassdoor',
      query,
      url: buildGlassdoorUrl(query, experienceLevel),
      parser: parseGlassdoor,
    });
  }

  for (const query of queries.slice(0, 4)) {
    for (const loc of locations.slice(0, 2)) {
      plans.push({
        source: 'Indeed',
        query,
        location: loc,
        url: buildIndeedUrl(query, loc),
        parser: parseIndeed,
      });
    }
  }

  for (const query of queries.slice(0, 3)) {
    plans.push({
      source: 'Internshala',
      query,
      url: buildInternshalaUrl(query),
      parser: parseInternshala,
    });
  }

  for (const query of queries.slice(0, 3)) {
    for (const loc of locations.slice(0, 2)) {
      plans.push({
        source: 'Wellfound',
        query,
        location: loc,
        url: buildWellfoundUrl(query, loc),
        parser: parseWellfound,
      });
    }
  }

  return plans;
}

function extractSkillsFromTitle(title: string): string[] {
  const t = title.toLowerCase();
  return KNOWN_SKILLS.filter(s => t.includes(s.toLowerCase())).slice(0, 5);
}

function dedupeRawJobs(scraped: ScrapedJobRaw[]): ScrapedJobRaw[] {
  const seen = new Set<string>();

  return scraped.filter((job) => {
    const key = job.link
      ? `link:${job.link.trim().toLowerCase()}`
      : `meta:${job.title.toLowerCase().replace(/[^a-z0-9]/g, '')}-${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}-${job.location.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function convertToJobs(scraped: ScrapedJobRaw[], userSkills: string[]): Job[] {
  return scraped.map((job, i) => {
    const titleWords = job.title.toLowerCase().split(/[\s,/\-()]+/);
    const matched = userSkills.filter(skill =>
      titleWords.some(w => skill.toLowerCase().includes(w) || w.includes(skill.toLowerCase()))
    );
    const matchPct = userSkills.length > 0
      ? Math.min(95, Math.round((matched.length / Math.max(userSkills.length, 3)) * 100) + 40 + Math.floor(Math.random() * 15))
      : 50 + Math.floor(Math.random() * 30);

    return {
      id: `${job.source.toLowerCase()}-${i}-${Date.now()}`,
      title: job.title,
      company: job.company || 'See listing',
      location: job.location || 'India',
      salary: job.salary || 'See listing',
      type: 'Full-time',
      matchPercentage: Math.min(matchPct, 98),
      skills: matched.length > 0 ? matched : extractSkillsFromTitle(job.title),
      description: `${job.title}${job.company ? ` at ${job.company}` : ''}${job.location ? ` in ${job.location}` : ''}. Source: ${job.source}. ${job.posted || ''}`,
      applyUrl: job.link || '#',
    };
  });
}

// ============================================================
// MAIN: SCRAPE ALL SITES IN PARALLEL
// ============================================================
export async function fetchRealJobs(
  skills: string[],
  targetRole: string,
  location: string = 'India',
  experienceLevel: ExperienceLevel = 'fresher',
): Promise<Job[]> {
  const role = targetRole || (skills.length > 0 ? `${skills[0]} Developer` : 'Software Developer');
  const searchPlans = buildSearchPlans(skills, role, location, experienceLevel);

  console.log(
    'Scraping jobs with expanded search plans:',
    searchPlans.map(plan => ({ source: plan.source, query: plan.query, location: plan.location || '-', url: plan.url }))
  );

  const results = await Promise.allSettled(
    searchPlans.map(async (plan) => {
      const md = await jinaFetch(plan.url);
      return {
        ...plan,
        jobs: plan.parser(md),
      };
    })
  );

  const allRaw: ScrapedJobRaw[] = [];
  const sourceTotals: Record<JobSource, number> = {
    LinkedIn: 0,
    Naukri: 0,
    Unstop: 0,
    Glassdoor: 0,
    Indeed: 0,
    Internshala: 0,
    Wellfound: 0,
  };

  results.forEach((result, index) => {
    const plan = searchPlans[index];

    if (result.status === 'fulfilled') {
      const found = result.value.jobs.length;
      sourceTotals[plan.source] += found;

      if (found > 0) {
        console.log(`${plan.source} [${plan.query}${plan.location ? ` | ${plan.location}` : ''}]: found ${found} jobs`);
        allRaw.push(...result.value.jobs);
      } else {
        console.warn(`${plan.source} [${plan.query}${plan.location ? ` | ${plan.location}` : ''}]: no jobs found`);
      }
    } else {
      console.warn(`${plan.source} [${plan.query}${plan.location ? ` | ${plan.location}` : ''}]:`, result.reason);
    }
  });

  if (allRaw.length === 0) {
    console.warn('No jobs from any source, returning empty');
    return [];
  }

  console.log('Expanded search totals by source:', sourceTotals);

  const uniqueRaw = dedupeRawJobs(allRaw);

  // Convert to Job type
  const allJobs = convertToJobs(uniqueRaw, skills);

  // Deduplicate by normalized title+company
  const seen = new Set<string>();
  const unique = allJobs.filter(job => {
    const key = `${job.title.toLowerCase().replace(/[^a-z]/g, '')}-${job.company.toLowerCase().replace(/[^a-z]/g, '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by match percentage descending
  unique.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return unique;
}
