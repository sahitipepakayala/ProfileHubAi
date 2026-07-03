/**
 * Ranking Agent
 * Takes scored candidates and orders them by match score, highest first.
 * Optionally limits to top N results.
 */
const rankCandidates = (scoredCandidates, limit = 10) => {
  const sorted = [...scoredCandidates].sort((a, b) => b.matchScore - a.matchScore);
  return sorted.slice(0, limit);
};

module.exports = { rankCandidates };