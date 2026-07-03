// import axiosInstance from "./axiosInstance";
// import type {
//   Job,
//   CandidateMatch,
//   SkillGapResult,
//   InterviewQuestionsResult,
//   MatchExplanation,
//   Application,
//   ApplicationStatus,
//   Interview,
//   JobDashboard,
// } from "../types";

// export const createJob = async (
//   rawDescription: string
// ): Promise<{ message: string; job: Job }> => {
//   const { data } = await axiosInstance.post("/jobs", { rawDescription });
//   return data;
// };

// export const getMyJobs = async (): Promise<Job[]> => {
//   const { data } = await axiosInstance.get("/jobs/my-jobs");
//   return data;
// };

// export const getJobById = async (id: string): Promise<Job> => {
//   const { data } = await axiosInstance.get(`/jobs/${id}`);
//   return data;
// };

// export const deleteJob = async (id: string): Promise<{ message: string }> => {
//   const { data } = await axiosInstance.delete(`/jobs/${id}`);
//   return data;
// };

// export const analyzeJob = async (id: string): Promise<{ message: string; job: Job }> => {
//   const { data } = await axiosInstance.post(`/jobs/${id}/analyze`);
//   return data;
// };

// export const getSemanticMatches = async (
//   id: string
// ): Promise<{ message: string; count: number; matches: CandidateMatch[] }> => {
//   const { data } = await axiosInstance.get(`/jobs/${id}/semantic-matches`);
//   return data;
// };

// export const getHybridMatches = async (
//   id: string
// ): Promise<{ message: string; count: number; matches: CandidateMatch[] }> => {
//   const { data } = await axiosInstance.get(`/jobs/${id}/hybrid-matches`);
//   return data;
// };

// export const generateInvitation = async (
//   jobId: string,
//   candidateId: string
// ): Promise<{ message: string; invitation: string }> => {
//   const { data } = await axiosInstance.post(`/jobs/${jobId}/invite/${candidateId}`);
//   return data;
// };

// export const getSkillGap = async (
//   jobId: string,
//   candidateId: string
// ): Promise<{ message: string; gapAnalysis: SkillGapResult }> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/skill-gap/${candidateId}`);
//   return data;
// };

// export const getInterviewQuestions = async (
//   jobId: string,
//   candidateId: string
// ): Promise<{ message: string; questions: InterviewQuestionsResult }> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/interview-questions/${candidateId}`);
//   return data;
// };

// export const explainCandidateMatch = async (
//   jobId: string,
//   candidateId: string
// ): Promise<{
//   matchScore: number;
//   matchedSkills: string[];
//   missingSkills: string[];
//   explanation: MatchExplanation;
// }> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/matches/${candidateId}/explain`);
//   return data;
// };

// export const applyToJob = async (
//   jobId: string
// ): Promise<{ message: string; application: Application }> => {
//   const { data } = await axiosInstance.post(`/jobs/${jobId}/apply`);
//   return data;
// };

// export const getJobApplications = async (
//   jobId: string
// ): Promise<{ count: number; applications: Application[] }> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/applications`);
//   return data;
// };

// export const updateApplicationStatus = async (
//   jobId: string,
//   applicationId: string,
//   status: ApplicationStatus
// ): Promise<{ message: string; application: Application }> => {
//   const { data } = await axiosInstance.patch(
//     `/jobs/${jobId}/applications/${applicationId}`,
//     { status }
//   );
//   return data;
// };

// export const scheduleInterview = async (
//   jobId: string,
//   applicationId: string,
//   payload: {
//     scheduledAt: string;
//     mode?: "video" | "phone" | "onsite";
//     meetingDetails?: string;
//     notes?: string;
//   }
// ): Promise<{ message: string; interview: Interview }> => {
//   const { data } = await axiosInstance.post(
//     `/jobs/${jobId}/applications/${applicationId}/interview`,
//     payload
//   );
//   return data;
// };

// export const getJobInterviews = async (
//   jobId: string
// ): Promise<{ count: number; interviews: Interview[] }> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/interviews`);
//   return data;
// };

// export const getJobDashboard = async (jobId: string): Promise<JobDashboard> => {
//   const { data } = await axiosInstance.get(`/jobs/${jobId}/dashboard`);
//   return data;
// };


import axiosInstance from "./axiosInstance";
import type {
  Job,
  KeywordCandidateMatch,
  SemanticCandidateMatch,
  HybridCandidateMatch,
  SkillGapResult,
  InterviewQuestionsResult,
  MatchExplanation,
  Application,
  ApplicationStatus,
  Interview,
  JobDashboard,
} from "../types";

export const createJob = async (
  rawDescription: string
): Promise<{ message: string; job: Job }> => {
  const { data } = await axiosInstance.post("/jobs", { rawDescription });
  return data;
};

export const getMyJobs = async (): Promise<Job[]> => {
  const { data } = await axiosInstance.get("/jobs/my-jobs");
  return data;
};

export const getJobById = async (id: string): Promise<Job> => {
  const { data } = await axiosInstance.get(`/jobs/${id}`);
  return data;
};

export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/jobs/${id}`);
  return data;
};

export const analyzeJob = async (id: string): Promise<{ message: string; job: Job }> => {
  const { data } = await axiosInstance.post(`/jobs/${id}/analyze`);
  return data;
};

// Keyword pipeline (was missing entirely from this file)
export const getJobMatches = async (
  id: string
): Promise<{ message: string; count: number; matches: KeywordCandidateMatch[] }> => {
  const { data } = await axiosInstance.get(`/jobs/${id}/matches`);
  return data;
};

export const getSemanticMatches = async (
  id: string
): Promise<{ message: string; count: number; matches: SemanticCandidateMatch[] }> => {
  const { data } = await axiosInstance.get(`/jobs/${id}/semantic-matches`);
  return data;
};

export const getHybridMatches = async (
  id: string
): Promise<{ message: string; count: number; matches: HybridCandidateMatch[] }> => {
  const { data } = await axiosInstance.get(`/jobs/${id}/hybrid-matches`);
  return data;
};

export const generateInvitation = async (
  jobId: string,
  candidateId: string
): Promise<{ message: string; invitation: string }> => {
  const { data } = await axiosInstance.post(`/jobs/${jobId}/invite/${candidateId}`);
  return data;
};

export const getSkillGap = async (
  jobId: string,
  candidateId: string
): Promise<{ message: string; gapAnalysis: SkillGapResult }> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/skill-gap/${candidateId}`);
  return data;
};

export const getInterviewQuestions = async (
  jobId: string,
  candidateId: string
): Promise<{ message: string; questions: InterviewQuestionsResult }> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/interview-questions/${candidateId}`);
  return data;
};

export const explainCandidateMatch = async (
  jobId: string,
  candidateId: string
): Promise<{
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: MatchExplanation;
}> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/matches/${candidateId}/explain`);
  return data;
};

export const applyToJob = async (
  jobId: string
): Promise<{ message: string; application: Application }> => {
  const { data } = await axiosInstance.post(`/jobs/${jobId}/apply`);
  return data;
};

export const getJobApplications = async (
  jobId: string
): Promise<{ count: number; applications: Application[] }> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/applications`);
  return data;
};

export const updateApplicationStatus = async (
  jobId: string,
  applicationId: string,
  status: ApplicationStatus
): Promise<{ message: string; application: Application }> => {
  const { data } = await axiosInstance.patch(
    `/jobs/${jobId}/applications/${applicationId}`,
    { status }
  );
  return data;
};

export const scheduleInterview = async (
  jobId: string,
  applicationId: string,
  payload: {
    scheduledAt: string;
    mode?: "video" | "phone" | "onsite";
    meetingDetails?: string;
    notes?: string;
  }
): Promise<{ message: string; interview: Interview }> => {
  const { data } = await axiosInstance.post(
    `/jobs/${jobId}/applications/${applicationId}/interview`,
    payload
  );
  return data;
};

export const getJobInterviews = async (
  jobId: string
): Promise<{ count: number; interviews: Interview[] }> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/interviews`);
  return data;
};

export const getJobDashboard = async (jobId: string): Promise<JobDashboard> => {
  const { data } = await axiosInstance.get(`/jobs/${jobId}/dashboard`);
  return data;
};

export const updateJobSkills = async (
  jobId: string,
  skills: string[]
): Promise<{ message: string; job: Job }> => {
  const { data } = await axiosInstance.put(`/jobs/${jobId}/skills`, { skills });
  return data;
};

export const sendJobMessage = async (
  jobId: string,
  payload: { candidateId: string; content: string; type?: "invitation" | "message" }
): Promise<{ message: string; data: import("../types").Message }> => {
  const { data } = await axiosInstance.post(`/jobs/${jobId}/messages`, payload);
  return data;
};

export const getJobMessages = async (
  jobId: string,
  candidateId?: string
): Promise<{ count: number; messages: import("../types").Message[] }> => {
  const params = candidateId ? { candidateId } : {};
  const { data } = await axiosInstance.get(`/jobs/${jobId}/messages`, { params });
  return data;
};