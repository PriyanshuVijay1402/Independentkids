// controllers/profileSummary.js
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateProfileSummary(user) {
  const prompt = `Summarize this user profile in 2–3 sentences:
- Name: ${user.name}
- Trust Score: ${user.trustScore}
- Feedbacks: ${user.feedbackHistory.length}`;

  const completion = await anthropic.messages.create({
    model: "claude-3.5-sonnet-20240620",
    max_tokens: 200,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return completion.content[0].text;
}

module.exports = { generateProfileSummary };
