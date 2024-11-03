const initialValidatePrompts = require('../prompts/initial_validation_prompt');
const { claude } = require('../claude-util');
// const { Ollama } = require('ollama');
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
      // const llmResponse = await this.ollama.generate({
      //   model: 'phi3:14b',
      //   prompt: initialValidatePrompts.initValidation(this.stateManager.userProfile, context)
      // });
      // console.debug(llmResponse)

      const validationResponse = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);
      console.debug(validationResponse)
      return JSON.parse(validationResponse);
    } catch (error) {
      console.error('Error in validateInitResponse:', error);
      throw error;
    }
  }
}

module.exports = ValidationHandler;
