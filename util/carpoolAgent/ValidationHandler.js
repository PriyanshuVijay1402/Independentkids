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

      const validationResponse = await this.ollama.generate({
        model: 'phi3:14b',
        prompt: initialValidatePrompts.initValidation(this.stateManager.userProfile, context)
      });
      if (validationResponse) {
        return validationResponse
      }
      return null
    } catch (error) {
      console.error('Error in handleFirstQuestionResponse:', error);
      throw error;
    }
  }

  generateErrorResponse(question, validationReason) {
    return {
      answer: `Your answer needs more detail. ${validationReason}\n\nWhy this matters: ${question.importance}`,
      suggestions: question.followUp,
      isProfileComplete: false
    };
  }
}

module.exports = ValidationHandler;