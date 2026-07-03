const { getChatCompletion } = require("../services/openaiService");

/**
 * Skill Gap Analysis Agent
 * Compares a candidate's current skills against a job's required skills
 * and identifies what's missing, why it matters, and how to bridge the gap.
 */
const analyzeSkillGap = async (candidateSkills, requiredSkills, jobRoles) => {
  const systemPrompt = `You are a Skill Gap Analysis Agent for a recruitment platform.
Compare a candidate's skills against a job's required skills and provide actionable, encouraging gap analysis.

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "matchedSkills": ["skills the candidate already has that the job needs"],
  "missingSkills": ["skills the job needs that the candidate doesn't have"],
  "gapAnalysis": [
    {
      "skill": "missing skill name",
      "whyItMatters": "one sentence explaining why this skill is important for this role",
      "howToLearn": "one specific, actionable suggestion to learn this skill"
    }
  ],
  "overallReadiness": "a one-sentence honest summary of how ready the candidate is for this role"
}

Rules:
- Be encouraging but honest — don't sugarcoat major gaps
- If the candidate already has all required skills, return empty missingSkills and gapAnalysis arrays
- Keep whyItMatters and howToLearn concise and specific (not generic advice like "take an online course")`;

  const userPrompt = `Job Role(s): ${jobRoles.join(", ")}
Required Skills: ${requiredSkills.join(", ")}
Candidate's Current Skills: ${candidateSkills.join(", ")}

Analyze the skill gap.`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Skill Gap Agent failed to parse:", rawResponse);
    throw new Error("Skill Gap Agent returned invalid JSON");
  }
};

module.exports = { analyzeSkillGap };