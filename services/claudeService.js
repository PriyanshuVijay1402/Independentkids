const axios = require('axios');

async function callClaude(prompt, { model = "claude-3.5-sonnet-20240620", max_tokens = 300 } = {}) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 20000
      }
    );

    // This matches the earlier response access pattern you used
    return response.data?.content?.[0]?.text?.trim() ?? '';
  } catch (err) {
    console.error('Claude API Error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { callClaude };
