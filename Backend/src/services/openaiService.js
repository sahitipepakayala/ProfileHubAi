const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Sends a prompt to Groq (Llama model) and returns the raw text response.
 * Function name kept as getChatCompletion so agents don't need to change.
 */
const getChatCompletion = async (systemPrompt, userPrompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // strong, free, fast
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw new Error("Failed to get response from Groq");
  }
};

module.exports = { getChatCompletion };