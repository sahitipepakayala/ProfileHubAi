const { getChatCompletion } = require("../services/openaiService");

/**
 * Resume Parsing Agent
 * Takes raw extracted resume text and converts it into structured profile data:
 * skills, experience years, and career goal.
 */
const parseResume = async (resumeText) => {
  const systemPrompt = `You are a Resume Parsing Agent for a recruitment platform.
Extract structured candidate information from raw resume text.

Respond ONLY with valid JSON in this exact format, with no extra text, no markdown, no explanation:
{
  "skills": ["array of specific technical skills found in the resume, e.g. React, Node.js, Python"],
  "experienceYears": number (total years of professional experience, estimate from work history dates if not explicitly stated, 0 if entry-level/no experience found),
  "careerGoal": "a short one-sentence inferred career objective based on the resume content, e.g. 'Full Stack Developer specializing in MERN stack'",
  "projects": [
    { "title": "project name as it appears (or a short descriptive title if unnamed)", "description": "one sentence summary of what it does and the tech used" }
  ],
  "strengths": ["array of genuine professional strengths evidenced by the resume content, e.g. 'Delivered projects independently', 'Strong debugging ability' - NOT generic soft-skill buzzwords with no evidence"]
}

Rules:
- Only extract skills that are genuinely technical/professional skills, not soft skills like "teamwork"
- If the resume text is unclear or too short to extract meaningful data, return empty/default values rather than guessing wildly
- Only include projects that are actually described in the resume (a projects/portfolio section, or bullet points describing built things) - return an empty array if none are found, don't invent projects
- Strengths must be inferable from actual resume content (e.g. leading a team, shipping a project solo, quantified achievements) - not generic filler`;

  const userPrompt = `Resume text:\n"""${resumeText}"""`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("Failed to parse resume agent response:", rawResponse);
    throw new Error("Resume Parsing Agent returned invalid JSON");
  }
};

module.exports = { parseResume };