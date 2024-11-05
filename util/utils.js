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
  // Convert input to string if it's not already
  const text = typeof input === 'object' ? 
    (input.response || JSON.stringify(input)) : 
    String(input);

  // Try to find JSON object pattern between curly braces
  const jsonMatch = text.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (jsonMatch) {
    try {
      // Try to parse the matched content
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Failed to parse matched JSON content:', e);
    }
  }

  // If no valid JSON found, try to parse the entire text
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse entire text as JSON:', e);
    // Return the original text if all parsing attempts fail
    return text;
  }
}


module.exports = {
  claude,
  extractJSON
};