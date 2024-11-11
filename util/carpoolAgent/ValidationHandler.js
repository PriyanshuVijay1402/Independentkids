const initialValidatePrompts = require('../prompts/initial_validation_prompt');
const { claude, extractJSON } = require('../utils');
const Phase = require('../vars/stateEnum');
const Model = require('../vars/claudeEnum');

class ValidationHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    // this.ollama = new Ollama();
  }

  async validateInitResponse(response) {
    try {
      const context = {
        question: this.stateManager.getCurrentQuestion(),
        answer: response
      };
      const prompt = initialValidatePrompts.initValidation(this.stateManager.userProfile, context);
      const llmResponse = await claude(prompt);
      const validationResponse = extractJSON(llmResponse);
      return validationResponse;
    } catch (error) {
      console.error('Error in validateInitResponse:', error);
      throw error;
    }
  }
}

module.exports = ValidationHandler;
