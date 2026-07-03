const axios = require("axios");

const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

/**
 * Converts a piece of text into a 384-dimension embedding vector
 * using a free Hugging Face sentence-transformer model.
 */
const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      HF_MODEL_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Embedding generation failed:", error.response?.data || error.message);
    throw new Error("Failed to generate embedding");
  }
};

module.exports = { generateEmbedding };