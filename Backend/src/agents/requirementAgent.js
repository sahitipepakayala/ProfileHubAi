const { getChatCompletion } = require("../services/openaiService");

/**
 * Requirement Analysis Agent
 * Takes a company's natural-language hiring description
 * and extracts structured data: roles, skills, experience level.
 */
const analyzeRequirement = async (rawDescription) => {
  const systemPrompt = `You are a Requirement Analysis Agent for a recruitment platform.
Extract structured hiring information from natural language text.

IMPORTANT RULES for the "skills" field:
- Always output SPECIFIC, CONCRETE technology or skill names — NEVER vague categories like "Programming languages", "Database management", or "API design".
- If the job text mentions specific technologies (e.g. "React", "Django", "Spring Boot"), use exactly those.
- If the job text does NOT mention any specific stack (e.g. just says "Backend Developer" with nothing else), do NOT assume one specific stack (like only Node.js, or only Django). Instead, extract stack-neutral backend competencies plus a SHORT list of the most common backend technologies across different stacks, so candidates from any backend background can be considered. Example for a generic "Backend Developer":
  ["Node.js", "Express", "Django", "Spring Boot", "REST APIs", "SQL", "MongoDB", "Backend Development"]
- Similarly for a generic "Frontend Developer" with no stack mentioned:
  ["React", "Angular", "Vue.js", "JavaScript", "HTML", "CSS"]
- The goal is to cast a reasonably WIDE net when the company hasn't specified a stack, rather than guessing one specific framework.
- Every skill in the array must be something a candidate could realistically list on their own profile.

Respond ONLY with valid JSON in this exact format, with no extra text, no markdown, no explanation:
{
  "roles": ["string array of job roles/titles mentioned"],
  "skills": ["string array of SPECIFIC technical skills, never vague categories"],
  "experienceYears": number (estimated minimum years of experience required, 0 if not mentioned)
}`;

  const userPrompt = `Hiring requirement: "${rawDescription}"`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("Failed to parse agent response:", rawResponse);
    throw new Error("Requirement Analysis Agent returned invalid JSON");
  }
};

module.exports = { analyzeRequirement };