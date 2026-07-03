const { generateEmbedding } = require("../services/embeddingService");
const { vectorSearchCandidates } = require("../services/vectorSearchService");

/**
 * Semantic Matching Agent
 * Converts the job's extracted skills into an embedding,
 * then finds candidates whose skill embeddings are semantically closest —
 * solving the "Django vs Node.js" ambiguity problem that keyword matching couldn't.
 */
const semanticMatch = async (extractedSkills, limit = 10) => {
  if (!extractedSkills || extractedSkills.length === 0) {
    throw new Error("No extracted skills provided for semantic matching");
  }

  const skillsText = extractedSkills.join(", ");
  const jobEmbedding = await generateEmbedding(skillsText);

  const matches = await vectorSearchCandidates(jobEmbedding, limit);

  return matches;
};

module.exports = { semanticMatch };