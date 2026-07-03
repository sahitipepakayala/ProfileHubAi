const JobRequirement = require("../models/JobRequirement");

const MATCH_THRESHOLD = 0.75; // only show jobs at least 75% semantically similar

/**
 * Performs semantic vector search against job postings using MongoDB Atlas Vector Search.
 * Finds jobs whose skillsEmbedding is closest in meaning to the candidate's embedding.
 */
const vectorSearchJobs = async (candidateEmbedding, limit = 10) => {
  const results = await JobRequirement.aggregate([
    {
      $vectorSearch: {
        index: "job_vector_index",
        path: "skillsEmbedding",
        queryVector: candidateEmbedding,
        numCandidates: 50,
        limit: limit,
      },
    },
    {
      $match: { status: "open" },
    },
    {
      $lookup: {
        from: "companies",
        localField: "company",
        foreignField: "_id",
        as: "companyDetails",
      },
    },
    {
      $unwind: "$companyDetails",
    },
    {
      $project: {
        rawDescription: 1,
        extractedRoles: 1,
        extractedSkills: 1,
        experienceRequired: 1,
        status: 1,
        "companyDetails.companyName": 1,
        "companyDetails.industry": 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $match: { score: { $gte: MATCH_THRESHOLD } }, // filter out weak matches
    },
  ]);

  const resultsWithPercentage = results.map((job) => ({
    ...job,
    matchPercentage: Math.round(job.score * 100),
  }));

  return resultsWithPercentage;
};

module.exports = { vectorSearchJobs };