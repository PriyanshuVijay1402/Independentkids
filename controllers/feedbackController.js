const { callClaude } = require('../services/claudeService');

async function generateFeedback(req, res) {
  try {
    const { userInput } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: "userInput is required" });
    }
    const prompt = `The user provided this input: "${userInput}". Please generate helpful feedback.`;
    const result = await callClaude(prompt);
    res.json({ feedback: result });
  } catch (error) {
    res.status(500).json({ error: "Error generating feedback" });
  }
}

async function generateProfileSummary(req, res) {
  try {
    const { userData } = req.body;
    if (!userData) {
      return res.status(400).json({ error: "userData is required" });
    }
    const prompt = `Generate a professional profile summary for the following data: ${JSON.stringify(userData)}`;
    const result = await callClaude(prompt);
    res.json({ profileSummary: result });
  } catch (error) {
    res.status(500).json({ error: "Error generating profile summary" });
  }
}

module.exports = { generateFeedback, generateProfileSummary };
