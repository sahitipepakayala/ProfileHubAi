const { getChatCompletion } = require("../services/openaiService");

/**
 * Career Growth Agent
 * Unlike the Skill Gap Agent (which compares a candidate against ONE specific job),
 * this agent looks at the candidate's whole profile and stated career goal to suggest
 * certifications, project ideas, and a learning roadmap for where they want to go next.
 */
const generateCareerGrowthPlan = async (skills, experienceYears, careerGoal) => {
  const systemPrompt = `You are a Career Growth Agent for a recruitment platform.
Given a candidate's current skills, experience, and career goal, suggest a concrete growth plan.

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "careerSummary": "one or two sentence read on where this candidate currently stands",
  "recommendedCertifications": [
    { "name": "certification name", "reason": "why this specific cert helps this candidate's stated goal" }
  ],
  "projectIdeas": [
    { "title": "specific project idea", "skillsItBuilds": ["skill1", "skill2"], "whyItHelps": "one sentence on the resume/portfolio value" }
  ],
  "trendingSkillsToLearn": ["skills in demand for this candidate's target roles that they don't have yet"],
  "suggestedNextRole": "a realistic next job title given their current level, one step up from where they are now"
}

Rules:
- Tailor everything to the candidate's stated career goal, not generic advice.
- Certifications and project ideas must be specific and realistic for their current experience level — don't suggest advanced certifications to someone with 0 years of experience.
- Recommend exactly 2-3 certifications and 2-3 project ideas.
- If no career goal was provided, infer a reasonable direction from their current skills instead of leaving it generic.`;

  const userPrompt = `Candidate's current skills: ${skills.length > 0 ? skills.join(", ") : "none listed"}
Years of experience: ${experienceYears}
Stated career goal: ${careerGoal || "not specified"}

Generate a career growth plan.`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Career Growth Agent failed to parse:", rawResponse);
    throw new Error("Career Growth Agent returned invalid JSON");
  }
};

module.exports = { generateCareerGrowthPlan };