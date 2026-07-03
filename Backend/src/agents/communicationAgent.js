const { getChatCompletion } = require("../services/openaiService");

/**
 * Communication Agent
 * Drafts a personalized interview invitation message for a shortlisted candidate,
 * based on the job they matched with and their specific matched skills.
 */
const draftInvitation = async (candidateName, jobRoles, matchedSkills, companyName) => {
  const systemPrompt = `You are a Communication Agent for a recruitment platform.
Write a short, warm, professional interview invitation email to a candidate.

Rules:
- Keep it under 120 words
- Mention the specific role(s) and 1-2 of the candidate's matched skills naturally
- Friendly but professional tone, not overly formal
- End with a clear call to action (e.g. suggest scheduling a call)
- Do NOT use placeholder brackets like [Date] or [Time] — keep it generic and natural instead
- Respond with ONLY the email body text, no subject line, no extra commentary`;

  const userPrompt = `Candidate name: ${candidateName}
Company name: ${companyName}
Role(s): ${jobRoles.join(", ")}
Candidate's matched skills: ${matchedSkills.join(", ")}

Write the interview invitation email.`;

  const message = await getChatCompletion(systemPrompt, userPrompt);
  return message.trim();
};

module.exports = { draftInvitation };