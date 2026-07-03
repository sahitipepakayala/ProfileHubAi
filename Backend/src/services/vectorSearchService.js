const Candidate = require("../models/Candidate");

const vectorSearchCandidates = async (jobEmbedding, limit = 10) => {
  const results = await Candidate.aggregate([
    {
      $vectorSearch: {
        index: "candidate_vector_index",
        path: "skillsEmbedding",
        queryVector: jobEmbedding,
        numCandidates: 50,
        limit: limit,
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        skills: 1,
        experienceYears: 1,
        careerGoal: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // Convert raw cosine similarity (0-1) into a friendlier 0-100 match percentage
  const resultsWithPercentage = results.map((candidate) => ({
    ...candidate,
    matchPercentage: Math.round(candidate.score * 100),
  }));

  return resultsWithPercentage;
};

module.exports = { vectorSearchCandidates };