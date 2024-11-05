const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils.js');
// const { Ollama } = require('ollama');

const basicPrompts = require('../prompts/basic_question_prompt.js');
const Phase = require('../vars/stateEnum');
const Type = require('../vars/questionTypeEnum.js');

class MandatoryQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
    // this.ollama = new Ollama();
  }

  async generateMandatoryQuestion(input = null) {
    try {
      const state = this.stateManager.getState();
      // handle the initial dependent check
      if (state.currentType === Type.BASIC){
        const prompt = basicPrompts.basicQuestion(
          this.stateManager.memory.currentDependent.basic,
          input
        );

        // console.debug(prompt);
        const llmResponse = await claude(prompt);
        // const llmResponse = await this.ollama.generate({
        //   model: 'phi3:14b',
        //   prompt: initialPrompts.initQuestion(this.stateManager.userProfile)
        // });
        // console.debug(llmResponse)
        // const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);
        const responseText = extractJSON(llmResponse);
        this.stateManager.setCurrentQuestion(responseText.answer)
        this.stateManager.setCurrentSuggestion(responseText.hint)

        return responseText
      }
    } catch (error) {
      console.error('Error in generateMandatoryQuestion:', error);
      throw error;
    }
  }

  async handleMandatoryPhase(input) {
    try {
      const state = this.stateManager.getState();
      console.debug(state);
      let response;

      // If current type is NULL, check dependent status and provide initial mandatory question
      if (!state.currentType ) {
        // set question type to BASIC, ask first question for new dependent
        if (!this.stateManager.getCurrentDependent().basic.name) {
          response = {
            answer: "Of course! Let's start with some basic information for your new dependent!",
            hintMsg: "You can provide me information such as",
            hints: ["name", "gender", "age", "grade"]
          };
          this.stateManager.memory.currentType = Type.BASIC;
        }
        // set question type to ACTIVITY, ask first question for user selected dependent
        else {
          response = {
            answer: `That's great! Let's work on a new activity for ${this.stateManager.getCurrentDependent().basic.name}`,
            hintMsg: "Please provide me some details about this activity",
            hints: ["name", "address", "time window"]
          };
          this.stateManager.memory.currentType = Type.ACTIVITY;
        }
        // remember current question
        this.stateManager.setCurrentQuestion(response.answer);
        return response;
      }

      // handle BASIC questions
      if (state.currentType === Type.BASIC )
      {
        response = await this.generateMandatoryQuestion(input);
        this.stateManager.memory.currentDependent.basic = response.basic;
        if (!response.isComplete) {
          return {
            answer: response.answer,
            hintMsg: response.hint
          };
        } else {
          return {
            answer: response.answer,
            hintMsg: response.hint,
            suggestions: ["I have some updates", "I'm good for next step"]
          }
          // if user say YES, update memory.currentDependent.basic, proceed to SCHOOL type
          // if user say NO, ask user what need to be changed.? and setCurrentQuestion
        }
      }

      return this.generateErrorResponse(validationResponse.reason);
    } catch (error) {
      const state = this.stateManager.getState();
      console.error(`Error in handleMandatoryPhase:`, error);
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
