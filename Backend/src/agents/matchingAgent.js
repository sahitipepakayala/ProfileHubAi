/**
 * Skill Matching Agent
 * Compares each candidate's skills against the job's required skills
 * and produces a match score (0-100) plus the matched/missing skills.
 *
 * This version uses keyword overlap — upgraded to semantic similarity later.
 */
/**
 * Scores a single candidate's skills against a single set of required skills.
 * Shared by the list pipeline (matchCandidates) and single-pair use cases
 * like the Match Explanation Agent, so scoring logic only lives in one place.
 */
const scoreCandidateAgainstSkills = (candidateSkills, requiredSkills) => {
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());
  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());

  const matchedSkills = normalizedRequired.filter((skill) =>
    normalizedCandidate.some((cSkill) => cSkill.includes(skill) || skill.includes(cSkill))
  );

  const missingSkills = normalizedRequired.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const matchScore =
    normalizedRequired.length > 0
      ? Math.round((matchedSkills.length / normalizedRequired.length) * 100)
      : 0;

  return { matchScore, matchedSkills, missingSkills };
};

const matchCandidates = (candidates, requiredSkills) => {
  const scoredCandidates = candidates.map((candidate) => {
    const { matchScore, matchedSkills, missingSkills } = scoreCandidateAgainstSkills(
      candidate.skills,
      requiredSkills
    );

    return {
      candidateId: candidate._id,
      fullName: candidate.fullName,
      email: candidate.email,
      matchScore,
      matchedSkills,
      missingSkills,
    };
  });

  return scoredCandidates;
};

module.exports = { matchCandidates, scoreCandidateAgainstSkills };