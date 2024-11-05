const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils.js');

const basicPrompts = require('../prompts/basic_question_prompt.js');
const {keywordsForNextStep} = require('../vars/vars.js');
const Phase = require('../vars/stateEnum');
const Type = require('../vars/questionTypeEnum.js');

class MandatoryQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
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

        const llmResponse = await claude(prompt);
        const responseText = extractJSON(llmResponse);
        this.stateManager.setCurrentQuestion(responseText.answer)
        this.stateManager.setCurrentSuggestion(responseText.suggestion)

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
      console.debug("--- init state ---")
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
        if (this.stateManager.memory.nextTypeReady && keywordsForNextStep.some(keyword => input.toLowerCase().includes(keyword))) {
          const nextQuestion = `Now, please provide some information about ${this.stateManager.getCurrentDependent().basic.name}'s school`
          this.stateManager.memory.currentType = Type.SCHOOL;
          this.stateManager.setCurrentQuestion(nextQuestion);
          this.stateManager.setCurrentSuggestion([])

          console.debug("--- info before move on to school type  ---");
          console.debug(this.stateManager.memory)

          return {
            answer: nextQuestion,
            hintMsg: `Feel free to skip, but some of those may help you finding carpool among ${this.stateManager.getCurrentDependent().basic.name}'s classmates`,
            hints: ["name", "address", "school time"]
          };
        }

        response = await this.generateMandatoryQuestion(input);
        console.debug(response)
        this.stateManager.memory.currentDependent.basic = response.basic;
        if (!response.isComplete) {
          return {
            answer: response.answer,
            hintMsg: response.hint
          };
        } else {
          this.stateManager.memory.nextTypeReady = true;
          return {
            answer: response.answer + "👍 We can move onto dependept's school information, or feel free to tell me if there's anything you'd like to update",
            hintMsg: response.hint,
            info: response.basic,
            suggestions: ["I'm good for next step"]
          };
        }
      }

      // handle BASIC questions
      if (state.currentType === Type.SCHOOL ){
        //TO DO: add logic to handle school information extraction & validation
        // need to adjust the prompt
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
