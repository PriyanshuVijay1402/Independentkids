const { Ollama } = require('ollama');
const StateManager = require('./StateManager');
const InitialQuestionHandler = require('./InitialQuestionHandler');
// prompt engineering files
const initialPrompts = require('../prompts/initial_question_prompt');
const mandatoryPrompts = require('../prompts/mandatory_questions_prompt');
const optionalPrompts = require('../prompts/optional_questions_prompt');

// variables
const Phase = require('../vars/stateEnum');

class CarpoolAgent {
  constructor(userId) {
    this.stateManager = new StateManager(userId);
    this.initialQuestionHandler = new InitialQuestionHandler(this.stateManager);
    this.ollama = new Ollama();
  }

  async getFirstQuestion() {
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

      return {
        answer: responseText,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Error in getFirstQuestion:', error);
      throw error;
    }
  }

  async generateResponse(input) {
    try {
      const state = this.stateManager.getState()
      const currentPhase = state.currentPhase;

      // Handle Initial Phase
      if (currentPhase === Phase.INITIAL) {
        const llmResponse = await this.initialQuestionHandler.handleInitialPhase(input);
        console.debug(llmResponse)
        if (llmResponse) return llmResponse;
      }
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }
}

module.exports = CarpoolAgent;
