// const { searchCandidates } = require("./searchAgent");
// const { matchCandidates } = require("./matchingAgent");
// const { rankCandidates } = require("./rankingAgent");
// const { semanticMatch } = require("./semanticMatchingAgent");
// const { runHybridMatching } = require("./hybridMatchingAgent");

// /**
//  * Original keyword-based pipeline: Search -> Match -> Rank
//  */
// const runMatchingPipeline = async (job) => {
//   if (!job.extractedSkills || job.extractedSkills.length === 0) {
//     throw new Error("Job has not been analyzed yet. Run /analyze first.");
//   }

//   const candidates = await searchCandidates(job.extractedSkills);
//   const scoredCandidates = matchCandidates(candidates, job.extractedSkills);
//   const rankedCandidates = rankCandidates(scoredCandidates, 10);

//   return rankedCandidates;
// };

// /**
//  * New semantic pipeline: Embed job -> Vector Search -> Ranked by similarity
//  */
// const runSemanticMatchingPipeline = async (job) => {
//   if (!job.extractedSkills || job.extractedSkills.length === 0) {
//     throw new Error("Job has not been analyzed yet. Run /analyze first.");
//   }

//   const matches = await semanticMatch(job.extractedSkills, 10);
//   return matches;
// };

// /**
//  * Hybrid pipeline: merges keyword + semantic pools into one unified score
//  */
// const runHybridMatchingPipeline = async (job, limit = 10) => {
//   return runHybridMatching(job, limit);
// };

// module.exports = { runMatchingPipeline, runSemanticMatchingPipeline, runHybridMatchingPipeline };







const { semanticMatch } = require("./semanticMatchingAgent");
const { runHybridMatching } = require("./hybridMatchingAgent");
const { runLangGraphMatchingPipeline } = require("./langgraphOrchestrator");

/**
 * Original keyword-based pipeline: Search -> Match -> Rank
 * Now orchestrated by an actual LangGraph StateGraph (see langgraphOrchestrator.js)
 * instead of plain sequential function calls. Same signature, same behavior.
 */
const runMatchingPipeline = async (job) => {
  if (!job.extractedSkills || job.extractedSkills.length === 0) {
    throw new Error("Job has not been analyzed yet. Run /analyze first.");
  }

  return runLangGraphMatchingPipeline(job.extractedSkills, 10);
};

/**
 * New semantic pipeline: Embed job -> Vector Search -> Ranked by similarity
 */
const runSemanticMatchingPipeline = async (job) => {
  if (!job.extractedSkills || job.extractedSkills.length === 0) {
    throw new Error("Job has not been analyzed yet. Run /analyze first.");
  }

  const matches = await semanticMatch(job.extractedSkills, 10);
  return matches;
};

/**
 * Hybrid pipeline: merges keyword + semantic pools into one unified score
 */
const runHybridMatchingPipeline = async (job, limit = 10) => {
  return runHybridMatching(job, limit);
};

module.exports = { runMatchingPipeline, runSemanticMatchingPipeline, runHybridMatchingPipeline };