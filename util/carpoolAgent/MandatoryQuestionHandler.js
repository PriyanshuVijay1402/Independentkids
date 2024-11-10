const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils.js');

const basicPrompts = require('../prompts/basic_question_prompt.js');
const schoolPrompts = require('../prompts/school_question_prompt.js');
const activityPrompts = require('../prompts/activity_question_prompt.js');
const {keywordsForNextStep, keywordsForSkip} = require('../vars/vars.js');
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
      let prompt;
      // handle the initial dependent check
      if (state.currentType === Type.BASIC){
        prompt = basicPrompts.basicQuestion(
          this.stateManager.memory.currentDependent.basic,
          input
        );
      } else if (state.currentType === Type.SCHOOL){
        prompt = schoolPrompts.schoolQuestion(
          this.stateManager.memory.currentDependent.school,
          input
        );
      } else if (state.currentType === Type.ACTIVITY){
        prompt = activityPrompts.activityQuestion(
          this.stateManager.memory.currentDependent.activity,
          input
        );
      }

      const llmResponse = await claude(prompt);
      console.debug(llmResponse);
      const responseText = extractJSON(llmResponse);
      this.stateManager.setCurrentQuestion(responseText.answer)
      this.stateManager.setCurrentSuggestion(responseText.suggestion)

      return responseText
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
            answer: `That's great! Let's work on a new activity for ${this.stateManager.getCurrentDependent().basic.name}.`,
            hintMsg: "Please provide me some require information about this activity, if you're open to sharing your ride with others for this activity, please mention it here.",
            hints: ["activity name", "address", "activity time window", "sharing preference"]
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
            hintMsg: `Optional, but it could assist locate a carpool among ${this.stateManager.getCurrentDependent().basic.name}'s classmates`,
            hints: ["name", "address", "school time"],
            suggestions: ["next step"]
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
            answer: response.answer + "👍 We can move onto dependent's school information, or feel free to tell me if there's anything you'd like to update",
            hintMsg: response.hint,
            info: response.basic,
            suggestions: ["next step"]
          };
        }
      }

      // handle SCHOOL questions
      if (state.currentType === Type.SCHOOL )
        {
          if ([...keywordsForNextStep, ...keywordsForSkip].some(keyword => input.toLowerCase().includes(keyword))) {
            const nextQuestion = `Now, let's work on ${this.stateManager.getCurrentDependent().basic.name}'s new activity`
            this.stateManager.memory.currentType = Type.ACTIVITY;
            this.stateManager.setCurrentQuestion(nextQuestion);
            this.stateManager.setCurrentSuggestion([])

            console.debug("--- info before move on to activity type  ---");
            console.debug(JSON.stringify(this.stateManager.memory, null, 2));

            return {
              answer: nextQuestion,
              hintMsg: "Following activity information is required for carpool matching, if you're open to sharing your ride with others for this activity, please mention it here.",
              hints: ["activity name", "address", "activity time window", "sharing preference"]
            };
          }

          response = await this.generateMandatoryQuestion(input);
          console.debug(response)
          this.stateManager.memory.currentDependent.school = response.school;
            // this.stateManager.memory.nextTypeReady = true;
          const text = `👍 We can work on the new activity for ${this.stateManager.getCurrentDependent().basic.name}, or feel free to update school information`;
          return {
            answer: response.answer ? response.answer + text : text ,
            hintMsg: response.hint ?  response.hintMsg : null,
            info: response.school,
            suggestions: ["next step"]
          };
        }

      // handle ACTIVITY questions
      if (state.currentType === Type.ACTIVITY )
        {
          if (this.stateManager.memory.nextTypeReady && keywordsForNextStep.some(keyword => input.toLowerCase().includes(keyword))) {
            const nextQuestion = `Now, you can provide a detailed schedule for the ${this.stateManager.memory.activity.name}`
            this.stateManager.memory.currentType = Type.SCHEDULE;
            this.stateManager.setCurrentQuestion(nextQuestion);
            this.stateManager.setCurrentSuggestion([])

            console.debug("--- info before move on to school type  ---");
            console.debug(this.stateManager.memory)

            return {
              answer: nextQuestion,
              hintMsg: `On a weekly basis, please specify the days on which the ${this.stateManager.memory.currentDependent.activity.name} occurs. You can then further specify your pickup and drop-off availability for each occurrence. Examples`,
              hints: ["I can take other kids for drop off between 4:30pm to 4:45pm.", "I cannot pick up on Friday."],
              suggestions: []
            };
          }

          response = await this.generateMandatoryQuestion(input);
          console.debug(response)
          this.stateManager.memory.currentDependent.activity = response.activity;
          if (!response.isComplete) {
            return {
              answer: response.answer,
              hintMsg: response.hint
            };
          } else {
            this.stateManager.memory.nextTypeReady = true;
            return {
              answer: response.answer + `👍 We can move onto schedule details, or feel free to tell me if there's anything you'd like to update on ${this.stateManager.memory.currentDependent.activity.name}`,
              hintMsg: response.hint,
              info: response.activity,
              suggestions: ["next step"]
            };
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
