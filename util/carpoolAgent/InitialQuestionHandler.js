const { Ollama } = require('ollama');
const ValidationHandler = require('./ValidationHandler');

const initialPrompts = require('../prompts/initial_question_prompt');
const Phase = require('../vars/stateEnum');

class OptionalQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
    this.ollama = new Ollama();
  }

  async generateInitialQuestion() {
    try {
      if (!this.stateManager.getProfile()) {
        await this.stateManager.setUserProfile();
      }

      const llmResponse = await this.ollama.generate({
        model: 'phi3:14b',
        prompt: initialPrompts.initQuestion(this.stateManager.userProfile)
      });

      const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);

      let suggestions = [];
      if (this.stateManager.userProfile.dependent_information &&
          this.stateManager.userProfile.dependent_information.length > 0
      ){
        suggestions = this.stateManager.userProfile.dependent_information.map(dep => `Add activity for ${dep.name}`);
        suggestions.push('Add a new dependent');
      }

      this.stateManager.setCurrentQuestion(responseText)
      this.stateManager.setCurrentSuggestion(suggestions)

      return {
        answer: responseText,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Error in getFirstQuestion:', error);
      throw error;
    }
  }

  async handleInitialPhase(input) {
    try {
      const state = this.stateManager.getState();
      let validationResponse = null;
      console.debug(state);

      // If there's no current question, ask initial question based on user's profile
      if (!state.currentQuestion) {
        const response = await this.generateInitialQuestion();
        return response;
      } else if (input) {
        validationResponse = await this.validationHandler.validateInitResponse(input)
      }

      if (validationResponse.isValid) {
        // move to mandatory phase
        this.stateManager.setCurrentPhase(Phase.MANDATORY);
        return null;
      } else {
        return validationResponse.reason
      }
    } catch (error) {
      console.error('Error in handleInitialPhase:', error);
      throw error;
    }
  }
}

module.exports = OptionalQuestionHandler;
