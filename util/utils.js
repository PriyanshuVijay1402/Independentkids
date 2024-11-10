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

  // Convert input to string and trim whitespace
  const text = String(input).trim();

  // Try to parse the entire text first
  try {
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find JSON objects in the text
    // This regex looks for objects that may contain nested objects
    const matches = text.match(/\{(?:[^{}]|\{[^{}]*\})*\}/g);
    if (matches) {
      for (const match of matches) {
        try {
          const parsed = JSON.parse(match);
          // Verify the parsed result is actually an object
          if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
          }
        } catch (parseError) {
          continue;
        }
      }
    }
    
    // If no valid JSON found, log a warning and return the original text
    console.warn('No valid JSON found in content:', text);
    return text;
  }
}

module.exports = {
  claude,
  extractJSON
};
