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

module.exports = {
  claude
};