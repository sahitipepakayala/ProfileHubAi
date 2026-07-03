const { getChatCompletion } = require("../services/openaiService");

/**
 * Match Explanation Agent
 * Takes the *already-computed* matched/missing skills for a specific
 * candidate-job pair and turns them into a short, human-readable explanation
 * of why the match was made — grounded in real data, not hallucinated,
 * since the agent is only ever given facts we already calculated ourselves.
 */
const explainMatch = async ({
  candidateName,
  candidateExperience,
  jobRoles,
  matchScore,
  matchedSkills,
  missingSkills,
}) => {
  const systemPrompt = `You are a Match Explanation Agent for a recruitment platform.
Given the ALREADY-COMPUTED overlap between a candidate's skills and a job's required skills,
write a short, honest explanation of why this candidate is (or isn't) a strong fit.

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "summary": "one or two sentence natural-language explanation of the fit, mentioning specific matched skills by name",
  "strengths": ["short bullet points, each citing a specific matched skill or the candidate's experience"],
  "considerations": ["short bullet points about missing skills or gaps a recruiter should be aware of — empty array if there are none"]
}

Rules:
- Only reference the matched/missing skills and match score given to you — never invent skills the candidate wasn't confirmed to have.
- Be honest about a low match score; don't oversell a weak match.
- Keep the summary to 1-2 sentences. Keep bullet points short (under 15 words each).`;

  const userPrompt = `Candidate: ${candidateName} (${candidateExperience} year(s) experience)
Job role(s): ${jobRoles.join(", ")}
Match score: ${matchScore}%
Matched skills: ${matchedSkills.length > 0 ? matchedSkills.join(", ") : "none"}
Missing skills: ${missingSkills.length > 0 ? missingSkills.join(", ") : "none"}

Explain this match.`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Match Explanation Agent failed to parse:", rawResponse);
    throw new Error("Match Explanation Agent returned invalid JSON");
  }
};

module.exports = { explainMatch };