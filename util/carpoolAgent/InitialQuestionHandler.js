const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils');
const { basicInfoTemplate } = require('../vars/dependentTemplate');

const initialPrompts = require('../prompts/initial_question_prompt');
const Phase = require('../vars/stateEnum');

class InitialQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
  }

  async generateInitialQuestion() {
    try {
      if (!this.stateManager.getProfile()) {
        await this.stateManager.setUserProfile();
      }
      const prompt = initialPrompts.initQuestion(this.stateManager.userProfile);
      const llmResponse = await claude(prompt);
      console.debug(llmResponse);
      //const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);
      const responseText = extractJSON(llmResponse);

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
      console.debug(state);

      // If there's no current question or no input, generate initial question
      if (!state.currentQuestion || !input) {
        const response = await this.generateInitialQuestion();
        return response;
      }

      // Only validate if we have input
      const validationResponse = await this.validationHandler.validateInitResponse(input);

      if (validationResponse.isValid) {
        let basicInfo;
        if (validationResponse.dependent === 'new dependent') {
          basicInfo = { ...basicInfoTemplate };
        } else {
          const dependent = this.stateManager.userProfile.dependent_information.find(dependent => dependent.name === validationResponse.dependent);
          const { name, gender, age, grade } = dependent;
          basicInfo = { name, gender, age, grade };
        }

        // Update just the basic property in the existing currentDependent structure
        this.stateManager.memory.currentDependent.basic = basicInfo;
        this.stateManager.setCurrentPhase(Phase.MANDATORY);
        this.stateManager.setCurrentQuestion(null);
        this.stateManager.setCurrentSuggestion([]);

        console.debug(this.stateManager.getState());
        return null;
      }
      return this.generateErrorResponse(validationResponse.reason);
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

module.exports = InitialQuestionHandler;
