const Candidate = require("../models/Candidate");

/**
 * Candidate Search Agent
 * Searches the candidate database for profiles that could be relevant
 * based on extracted skills from the job requirement.
 *
 * This is a broad first-pass search — casts a wide net.
 * The Matching Agent (next stage) does the precise scoring.
 */
const searchCandidates = async (extractedSkills) => {
  if (!extractedSkills || extractedSkills.length === 0) {
    return [];
  }

  // Case-insensitive partial match against any of the extracted skills
  const candidates = await Candidate.find({
    skills: {
      $in: extractedSkills.map((skill) => new RegExp(skill, "i")),
    },
  }).select("-password");

  return candidates;
};

module.exports = { searchCandidates };