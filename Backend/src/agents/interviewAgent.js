const { getChatCompletion } = require("../services/openaiService");

/**
 * Interview Question Generator Agent
 * Generates personalized interview questions based on the candidate's
 * actual resume/skills and the specific job description.
 */
const generateInterviewQuestions = async (
  candidateSkills,
  candidateExperience,
  jobRoles,
  requiredSkills
) => {
  const systemPrompt = `You are an Interview Question Generator Agent for a recruitment platform.
Generate targeted, personalized interview questions based on the candidate's profile and the job requirements.

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "technicalQuestions": [
    {
      "question": "the interview question",
      "skillTested": "which skill this tests",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "experienceQuestions": [
    {
      "question": "behavioral/experience-based question",
      "purpose": "what the interviewer is trying to learn"
    }
  ],
  "preparationTip": "one specific tip for this candidate to prepare for this interview"
}

Rules:
- Generate exactly 4 technical questions and 2 experience questions
- Technical questions must be specific to the candidate's actual skills AND the job requirements — not generic
- Experience questions should probe real past work, not hypotheticals
- Difficulty should match the candidate's experience level (${candidateExperience} year(s) of experience)
- Questions should feel personalized, not copy-pasted from a generic list`;

  const userPrompt = `Job Role(s): ${jobRoles.join(", ")}
Required Skills for the Job: ${requiredSkills.join(", ")}
Candidate's Skills: ${candidateSkills.join(", ")}
Candidate's Experience: ${candidateExperience} year(s)

Generate personalized interview questions.`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Interview Agent failed to parse:", rawResponse);
    throw new Error("Interview Question Agent returned invalid JSON");
  }
};

module.exports = { generateInterviewQuestions };