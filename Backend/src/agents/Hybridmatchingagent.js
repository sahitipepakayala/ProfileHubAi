const { searchCandidates } = require("./searchAgent");
const { scoreCandidateAgainstSkills } = require("./matchingAgent");
const { generateEmbedding } = require("../services/embeddingService");
const { vectorSearchCandidates } = require("../services/vectorSearchService");

// How much weight each signal contributes to the final hybrid score.
// Keyword catches exact/near-exact skill overlap; semantic catches conceptually
// related skills (e.g. "Django" being close to "backend framework") that keyword
// matching alone would miss. Weighted evenly by default.
const KEYWORD_WEIGHT = 0.5;
const SEMANTIC_WEIGHT = 0.5;

/**
 * Standard cosine similarity between two equal-length vectors, mapped from
 * [-1, 1] to a [0, 1] range the same way MongoDB Atlas normalizes vectorSearchScore
 * for cosine-similarity indexes, so scores stay comparable to Atlas's own output.
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  const cosine = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return (cosine + 1) / 2; // normalize to 0-1
};

/**
 * Hybrid Matching Agent
 * Runs the keyword pool (Search Agent) and the semantic pool (vector search)
 * side by side, merges them into one deduplicated candidate set, and scores
 * every candidate on BOTH signals — so a candidate only found by one method
 * still gets a fair combined score instead of being scored 0 on the other.
 */
const runHybridMatching = async (job, limit = 10) => {
  if (!job.extractedSkills || job.extractedSkills.length === 0) {
    throw new Error("Job has not been analyzed yet. Run /analyze first.");
  }

  const skillsText = job.extractedSkills.join(", ");
  const jobEmbedding = await generateEmbedding(skillsText);

  const [keywordPool, semanticPool] = await Promise.all([
    searchCandidates(job.extractedSkills),
    vectorSearchCandidates(jobEmbedding, Math.max(limit, 10)),
  ]);

  // Merge both pools into one map keyed by candidate id, so each candidate is scored once
  const candidateMap = new Map();

  keywordPool.forEach((candidate) => {
    candidateMap.set(candidate._id.toString(), {
      candidateId: candidate._id,
      fullName: candidate.fullName,
      email: candidate.email,
      skills: candidate.skills,
      skillsEmbedding: candidate.skillsEmbedding,
      semanticMatchPercentage: undefined, // may get filled in below if also in the semantic pool
    });
  });

  semanticPool.forEach((candidate) => {
    const id = candidate._id.toString();
    if (!candidateMap.has(id)) {
      candidateMap.set(id, {
        candidateId: candidate._id,
        fullName: candidate.fullName,
        email: candidate.email,
        skills: candidate.skills,
        skillsEmbedding: null, // not projected by vector search; not needed since we already have its score
      });
    }
    candidateMap.get(id).semanticMatchPercentage = candidate.matchPercentage;
  });

  const hybridResults = Array.from(candidateMap.values()).map((candidate) => {
    const { matchScore: keywordScore, matchedSkills, missingSkills } = scoreCandidateAgainstSkills(
      candidate.skills,
      job.extractedSkills
    );

    // Prefer Atlas's own semantic score for candidates found via vector search;
    // otherwise compute cosine similarity manually against the candidate's stored embedding
    const semanticScore =
      candidate.semanticMatchPercentage !== undefined
        ? candidate.semanticMatchPercentage
        : Math.round(cosineSimilarity(jobEmbedding, candidate.skillsEmbedding) * 100);

    const hybridScore = Math.round(keywordScore * KEYWORD_WEIGHT + semanticScore * SEMANTIC_WEIGHT);

    return {
      candidateId: candidate.candidateId,
      fullName: candidate.fullName,
      email: candidate.email,
      keywordScore,
      semanticScore,
      hybridScore,
      matchedSkills,
      missingSkills,
    };
  });

  hybridResults.sort((a, b) => b.hybridScore - a.hybridScore);

  return hybridResults.slice(0, limit);
};

module.exports = { runHybridMatching };