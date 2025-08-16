const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils.js');

const optionalPrompts = require('../prompts/optional_question_prompt.js');
const validationPrompts = require('../prompts/optional_validation_prompt.js');
const {keywordsForEnd} = require('../vars/vars.js');
const Phase = require('../vars/stateEnum');

class OptionalQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
  }

  async generateOptionalQuestion() {
    try {
      const prompt = optionalPrompts.optionalQuestion(
          this.stateManager.memory.currentDependent.additional_info
        );

      const llmResponse = await claude(prompt);
      console.debug('LLM Response:', llmResponse);

      const responseText = extractJSON(llmResponse);

      // If no valid question is returned or the question is empty, move to confirmation
      if (!responseText || !responseText.question || responseText.question.trim() === '') {
        console.debug('No valid question returned, moving to confirmation phase');
        this.stateManager.memory.currentPhase = Phase.CONFIRMATION;
        return null;
      }

      this.stateManager.setCurrentQuestion(responseText);
      return responseText;
    } catch (error) {
      console.error('Error in generateOptionalQuestion:', error);
      throw error;
    }
  }

  isEndCommand(input) {
    // Split input into words and check if any word exactly matches an end keyword
    const inputWords = input.toLowerCase().split(/\s+/);
    return keywordsForEnd.some(keyword =>
      inputWords.some(word => word === keyword)
    );
  }

  async handleOptionalPhase(input) {
    try {
      // Generate initial optional Question
      if (!this.stateManager.memory.currentQuestion) {
        // handle new dependent
        if (!this.stateManager.memory.currentDependent.additional_info) {
          const nextQuestion = `Would you like to share a bit more about ${this.stateManager.memory.currentDependent.basic.name}'s carpooling needs?`
          this.stateManager.setCurrentQuestion(nextQuestion)
          return {
            answer: nextQuestion,
            hintMsg: "For example, you can mention anything like Safety & Emergency Protocols, Comfort & Amenities and/or Specific Needs",
            hints:["medical condition awareness", "drop off/pick up protocols", "seating arrangements", "entertainment needs", "temperature", "special assistance needs", "accommodations" ],
            suggestions: ["End and review"]
          };
        } else {
          const nextQuestion = `Following is ${this.stateManager.memory.currentDependent.basic.name}'s additional information, do you have anything to update?`
          this.stateManager.setCurrentQuestion(nextQuestion)
          return {
            answer: nextQuestion,
            info: this.stateManager.memory.currentDependent.additional_info,
            hintMsg: "For example, you can mention anything like Safety & Emergency Protocols, Comfort & Amenities and/or Specific Needs. If no update needed, feel free to end and review. 😊",
            suggestions: ["End and review"]
          }
        }
      }

      // Handle "End optional questions" command using exact word matching
      if (this.isEndCommand(input)) {
        // console.debug('End keyword found, moving to confirmation phase');
        this.stateManager.memory.currentPhase = Phase.CONFIRMATION;
        return null;
      }

      // Validate user's input
      const prompt = validationPrompts.optionalValidation(
        input,
        this.stateManager.memory.currentQuestion,
        this.stateManager.memory.currentDependent.additional_info
      );
      const validationResponse = await this.validationHandler.validateOptionalResponse(prompt);

      if (validationResponse.isValid){
        this.stateManager.setCurrentQuestion(null);
        // Initialize additional_info as an object if it doesn't exist
        if (!this.stateManager.memory.currentDependent.additional_info) {
          this.stateManager.memory.currentDependent.additional_info = {};
        }
        // Add the new info directly with the key name
        this.stateManager.memory.currentDependent.additional_info = {
          ...this.stateManager.memory.currentDependent.additional_info,
          ...validationResponse.info
        };

        const response = await this.generateOptionalQuestion();
        if (!response) {
          console.debug('No next question, returning null');
          return null; // Will trigger transition to CONFIRMATION phase
        }
        return {
          answer: response.question,
          hintMsg: response.hintMsg,
          hints: response.hints,
          info: this.stateManager.memory.currentDependent.additional_info,
          suggestions: ["End and review"]
        };
      }
      else {
        return {
          answer: `Let's try this again - ${this.stateManager.memory.currentQuestion.question}`,
          hintMsg: validationResponse.reason,
          suggestions: ["End and review"]
        }
      }
    } catch (error) {
      console.error('Error in handleOptionalPhase:', error);
      throw error;
    }
  }
}

module.exports = OptionalQuestionHandler;
