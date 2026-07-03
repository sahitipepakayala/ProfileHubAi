const { getChatCompletion } = require("../services/openaiService");

/**
 * Resume Feedback Agent
 * Unlike the Resume Parsing Agent (which only extracts structured data),
 * this agent critiques the resume and gives specific, actionable suggestions
 * to improve the candidate's chances of getting hired.
 */
const generateResumeFeedback = async (resumeText, careerGoal) => {
  const systemPrompt = `You are a Resume Feedback Agent for a recruitment platform.
Analyze raw resume text and give specific, actionable feedback — never generic advice like "improve your resume" or "add more details".

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "overallImpression": "one or two sentence honest summary of the resume's current strength",
  "strengths": ["specific things the resume already does well, citing actual content"],
  "improvementSuggestions": [
    {
      "area": "short label, e.g. 'Deployment experience', 'Quantified impact', 'Testing'",
      "suggestion": "specific, actionable suggestion — what to add or change, and why it matters to recruiters"
    }
  ],
  "missingElements": ["concrete gaps, e.g. 'No mention of testing frameworks', 'No quantified achievements (numbers, %, metrics)'"],
  "atsFriendlinessScore": number (0-100, how well this resume would parse/score in an ATS keyword scan)
}

Rules:
- Every suggestion must reference something specific to THIS resume, not boilerplate advice.
- Prioritize the 3-5 highest-impact improvements, not an exhaustive list.
- Be honest and direct, but constructive — this is meant to help the candidate improve, not discourage them.
- If a career goal is provided, tailor suggestions toward that goal.`;

  const userPrompt = `Resume text:
"""${resumeText}"""

Candidate's stated career goal: ${careerGoal || "not specified"}

Give feedback on this resume.`;

  const rawResponse = await getChatCompletion(systemPrompt, userPrompt);

  try {
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Resume Feedback Agent failed to parse:", rawResponse);
    throw new Error("Resume Feedback Agent returned invalid JSON");
  }
};

module.exports = { generateResumeFeedback };