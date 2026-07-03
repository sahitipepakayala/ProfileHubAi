// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: "company" | "candidate";
}

// ─── Candidate ──────────────────────────────────────────────────────────────

export interface Project {
  title: string;
  description: string;
}

export interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  skills: string[];
  experienceYears: number;
  resumeText: string;
  resumeUrl: string;
  careerGoal: string;
  projects: Project[];
  strengths: string[];
  role: "candidate";
  createdAt: string;
  updatedAt: string;
}

// ─── Company ────────────────────────────────────────────────────────────────

export interface Company {
  _id: string;
  companyName: string;
  email: string;
  industry: string;
  description: string;
  website: string;
  role: "company";
  createdAt: string;
  updatedAt: string;
}

// ─── Job ────────────────────────────────────────────────────────────────────

export type JobStatus = "open" | "closed" | "in-progress";

export interface Job {
  _id: string;
  company: string | { _id: string; companyName: string; industry: string };
  rawDescription: string;
  extractedRoles: string[];
  extractedSkills: string[];
  experienceRequired: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Application ────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired"
  | "withdrawn";

export interface Application {
  _id: string;
  candidate: string | Candidate;
  job: string | Job;
  company: string | Company;
  status: ApplicationStatus;
  matchScoreAtApply: number | null;
  invitationMessage?: string;
  invitationSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageType = "invitation" | "message";

export interface Message {
  _id: string;
  job: string | Job;
  application?: string | null;
  candidate: string | Candidate;
  company: string | Company;
  senderRole: "company" | "candidate";
  content: string;
  type: MessageType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Interview ───────────────────────────────────────────────────────────────

export type InterviewMode = "video" | "phone" | "onsite";
export type InterviewStatus =
  | "proposed"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export interface Interview {
  _id: string;
  application: string;
  job: string | Job;
  candidate: string | Candidate;
  company: string | Company;
  scheduledAt: string;
  mode: InterviewMode;
  meetingDetails: string;
  status: InterviewStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Matching ────────────────────────────────────────────────────────────────

export interface CandidateMatch {
  _id: string;
  fullName: string;
  email: string;
  skills: string[];
  experienceYears: number;
  careerGoal: string;
  score: number;
  matchPercentage: number;
}

export interface JobMatch {
  _id: string;
  rawDescription: string;
  extractedRoles: string[];
  extractedSkills: string[];
  experienceRequired: number;
  status: JobStatus;
  companyDetails: { companyName: string; industry: string };
  score: number;
  matchPercentage: number;
}

// ─── Skill Gap ───────────────────────────────────────────────────────────────

export interface GapItem {
  skill: string;
  whyItMatters: string;
  howToLearn: string;
}

export interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  gapAnalysis: GapItem[];
  overallReadiness: string;
}

// ─── Match Explanation ───────────────────────────────────────────────────────

export interface MatchExplanation {
  summary: string;
  strengths: string[];
  considerations: string[];
}

// ─── Interview Questions ─────────────────────────────────────────────────────

export interface TechnicalQuestion {
  question: string;
  skillTested: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ExperienceQuestion {
  question: string;
  purpose: string;
}

export interface InterviewQuestionsResult {
  technicalQuestions: TechnicalQuestion[];
  experienceQuestions: ExperienceQuestion[];
  preparationTip: string;
}

// ─── Resume Feedback ─────────────────────────────────────────────────────────

export interface ImprovementSuggestion {
  area: string;
  suggestion: string;
}

export interface ResumeFeedback {
  overallImpression: string;
  strengths: string[];
  improvementSuggestions: ImprovementSuggestion[];
  missingElements: string[];
  atsFriendlinessScore: number;
}

// ─── Career Growth ───────────────────────────────────────────────────────────

export interface Certification {
  name: string;
  reason: string;
}

export interface ProjectIdea {
  title: string;
  skillsItBuilds: string[];
  whyItHelps: string;
}

export interface CareerGrowthPlan {
  careerSummary: string;
  recommendedCertifications: Certification[];
  projectIdeas: ProjectIdea[];
  trendingSkillsToLearn: string[];
  suggestedNextRole: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface CompanyDashboard {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  totalApplicants: number;
  applicantsByStage: Record<string, number>;
}

export interface JobDashboard {
  job: { id: string; roles: string[]; status: JobStatus };
  totalApplicants: number;
  funnel: Record<string, number>;
  interviews: Record<string, number>;
}