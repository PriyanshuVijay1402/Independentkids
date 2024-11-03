const { Ollama } = require('ollama');
const initialValidatePrompts = require('../prompts/initial_validation_prompt');
const Phase = require('../vars/stateEnum');

class ValidationHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.ollama = new Ollama();
  }

  async validateInitResponse(response) {
    try {
      const context = {
        question: this.stateManager.getCurrentQuestion(),
        answer: response
      };
      console.debug(initialValidatePrompts.initValidation(this.stateManager.userProfile, context))
      const llmResponse = await this.ollama.generate({
        model: 'phi3:14b',
        prompt: initialValidatePrompts.initValidation(this.stateManager.userProfile, context)
      });

      const validationResponse = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);
      console.debug(validationResponse)
      return JSON.parse(validationResponse);
    } catch (error) {
      console.error('Error in handleFirstQuestionResponse:', error);
      throw error;
    }
  }
}

module.exports = ValidationHandler;