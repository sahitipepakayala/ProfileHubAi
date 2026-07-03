const pdfParse = require("pdf-parse");

/**
 * Extracts raw text content from a PDF buffer.
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing failed:", error.message);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = { extractTextFromPDF };