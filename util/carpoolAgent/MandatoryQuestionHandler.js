const ValidationHandler = require('./ValidationHandler');
const { claude } = require('../claude-util');
// const { Ollama } = require('ollama');
const mandatoryPrompts = require('../prompts/mandatory_question_prompt');
// const Phase = require('../vars/stateEnum');
const Model = require('../vars/claudeEnum');

class MandatoryQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
    // this.ollama = new Ollama();
  }

  async generateMandatoryQuestion() {
    try {
      const prompt = mandatoryPrompts.mandatoryQuestion(
        this.stateManager.getCurrentDependent()
      );
      console.debug(prompt);
      const llmResponse = await claude(prompt);
      // const llmResponse = await this.ollama.generate({
      //   model: 'phi3:14b',
      //   prompt: initialPrompts.initQuestion(this.stateManager.userProfile)
      // });
      console.debug(llmResponse)
      const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);
      let suggestions = [];

      // to do, update in memory userprofile
      // update current question
      this.stateManager.setCurrentQuestion(responseText)
      this.stateManager.setCurrentSuggestion(suggestions)

      return {
        answer: responseText,
        suggestions: suggestions,
        message: null
      };

    } catch (error) {
      console.error('Error in generateMandatoryQuestion:', error);
      throw error;
    }
  }

  async handleMandatoryPhase(input) {
    try {
      const state = this.stateManager.getState();
      console.debug(state);

      let msg;
      // If there's no current question or no input, generate initial question
      if (!state.currentQuestion || !input) {
        if (!this.stateManager.getCurrentDependent()) {
          msg = "Of course! Let's start with some basic information for your new dependent!"
        } else {
          msg = `That's great! Let's work on a new activity for ${this.stateManager.getCurrentDependent().name}`
        }
      }
      const response = await this.generateMandatoryQuestion(input);
      if (msg) {
        response.message = msg
      };
      return response;

      // Only validate if we have input
      // const validationResponse = await this.validationHandler.validateMandarotyResponse(input);

      // if (validationResponse.isValid) {
      //   // move to mandatory phase
      //   this.stateManager.setCurrentPhase(Phase.MANDATORY);
      //   this.stateManager.setCurrentQuestion(null);
      //   this.stateManager.setCurrentSuggestion([]);
      //   this.stateMamager.setCurrentDependent(validationResponse.dependent);
      //   console.debug(this.stateManager.getState());
      //   return null
      // }
      // return this.generateErrorResponse(validationResponse.reason);
    } catch (error) {
      console.error('Error in handleInitialPhase:', error);
      throw error;
    }
  }

  generateErrorResponse(validationReason) {
    return {
      answer: `${validationReason}😅 Let's try again.`,
      suggestions: this.stateManager.memory.currentSuggestion
    };
  }
}

module.exports = MandatoryQuestionHandler;
