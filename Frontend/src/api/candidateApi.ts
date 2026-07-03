import axiosInstance from "./axiosInstance";
import type {
  Candidate,
  JobMatch,
  MatchExplanation,
  ResumeFeedback,
  CareerGrowthPlan,
  Application,
  Interview,
} from "../types";

export const getMyProfile = async (): Promise<Candidate> => {
  const { data } = await axiosInstance.get("/candidate/me");
  return data;
};

export const updateMyProfile = async (
  updates: Partial<Pick<Candidate, "skills" | "experienceYears" | "careerGoal">>
): Promise<{ message: string; candidate: Candidate }> => {
  const { data } = await axiosInstance.put("/candidate/me", updates);
  return data;
};

export const uploadResume = async (
  file: File
): Promise<{ message: string; extracted: Partial<Candidate>; candidate: Partial<Candidate> }> => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await axiosInstance.post("/candidate/me/upload-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const generateEmbedding = async (): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post("/candidate/me/generate-embedding");
  return data;
};

export const getJobMatches = async (): Promise<{ message: string; count: number; matches: JobMatch[] }> => {
  const { data } = await axiosInstance.get("/candidate/me/job-matches");
  return data;
};

export const explainJobMatch = async (
  jobId: string
): Promise<{
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: MatchExplanation;
}> => {
  const { data } = await axiosInstance.get(`/candidate/me/job-matches/${jobId}/explain`);
  return data;
};

export const getMyApplications = async (): Promise<{ count: number; applications: Application[] }> => {
  const { data } = await axiosInstance.get("/candidate/me/applications");
  return data;
};

export const getResumeFeedback = async (): Promise<{ message: string; feedback: ResumeFeedback }> => {
  const { data } = await axiosInstance.get("/candidate/me/resume-feedback");
  return data;
};

export const getCareerGrowthPlan = async (): Promise<{ message: string; plan: CareerGrowthPlan }> => {
  const { data } = await axiosInstance.get("/candidate/me/career-growth");
  return data;
};

export const getMyInterviews = async (): Promise<{ count: number; interviews: Interview[] }> => {
  const { data } = await axiosInstance.get("/candidate/me/interviews");
  return data;
};

export const respondToInterview = async (
  interviewId: string,
  response: "confirmed" | "declined"
): Promise<{ message: string; interview: Interview }> => {
  const { data } = await axiosInstance.put(
    `/candidate/me/interviews/${interviewId}/respond`,
    { response }
  );
  return data;
};

export const getMyMessages = async (): Promise<{ count: number; messages: import("../types").Message[] }> => {
  const { data } = await axiosInstance.get("/candidate/me/messages");
  return data;
};

export const getJobConversation = async (
  jobId: string
): Promise<{ count: number; messages: import("../types").Message[] }> => {
  const { data } = await axiosInstance.get(`/candidate/me/messages/${jobId}`);
  return data;
};

export const sendCandidateMessage = async (
  jobId: string,
  content: string
): Promise<{ message: string; data: import("../types").Message }> => {
  const { data } = await axiosInstance.post("/candidate/me/messages", { jobId, content });
  return data;
};

export const withdrawApplication = async (
  applicationId: string
): Promise<{ message: string; application: Application }> => {
  const { data } = await axiosInstance.put(
    `/candidate/me/applications/${applicationId}/withdraw`
  );

  return data;
};