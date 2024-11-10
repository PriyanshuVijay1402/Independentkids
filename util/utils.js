require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const Model = require('./vars/claudeEnum');

// Initialize the client
const anthropic = new Anthropic();

async function claude(
  userMessage,
  model = Model.HAIKU,
  maxTokens = 1024
) {
  try {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: userMessage
      }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

function extractJSON(input) {
  // If input is already an object, return it directly
  if (typeof input === 'object' && input !== null) {
    return input;
  }

  // Convert input to string
  const text = String(input);

  // Try to parse the entire text first
  try {
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find the first valid JSON object
    const matches = text.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g);
    if (matches) {
      for (const match of matches) {
        try {
          const parsed = JSON.parse(match);
          // Return the first successfully parsed JSON
          return parsed;
        } catch (e) {
          continue;
        }
      }
    }
    
    console.warn('Failed to parse JSON content:', e);
    return text;
  }
}

module.exports = {
  claude,
  extractJSON
};
