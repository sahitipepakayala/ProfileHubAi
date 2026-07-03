const { generateEmbedding } = require("../services/embeddingService");
const { vectorSearchJobs } = require("../services/jobVectorSearchService");

/**
 * Candidate Job Search Agent
 * Uses the candidate's existing skill embedding to find semantically
 * matching open job postings.
 */
const findMatchingJobs = async (candidateSkillsEmbedding, limit = 10) => {
  if (!candidateSkillsEmbedding || candidateSkillsEmbedding.length === 0) {
    throw new Error("Candidate has no embedding yet. Generate embedding first.");
  }

  const matches = await vectorSearchJobs(candidateSkillsEmbedding, limit);
  return matches;
};

module.exports = { findMatchingJobs };