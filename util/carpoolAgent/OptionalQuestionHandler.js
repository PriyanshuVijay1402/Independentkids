const ValidationHandler = require('./ValidationHandler');
const { claude, extractJSON } = require('../utils.js');

const optionalPrompts = require('../prompts/optional_question_prompt.js');
const validationPrompts = require('../prompts/optional_validation_prompt.js');
const {keywordsForNA, keywordsForEnd} = require('../vars/vars.js');
const Phase = require('../vars/stateEnum');

class OptionalQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.validationHandler = new ValidationHandler(this.stateManager);
  }
  async generateOptionalQuestion(input = null) {
    try {
      const prompt = optionalPrompts.optionalQuestion(
          this.stateManager.memory.currentDependent,
          this.stateManager.memory.prevQuestions,
          input
        );

      const llmResponse = await claude(prompt);
      console.debug(llmResponse);

      const responseText = extractJSON(llmResponse);
      
      // If no valid question is returned or the question is empty, move to confirmation
      if (!responseText || !responseText.question || responseText.question.trim() === '') {
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

  async handleOptionalPhase(input) {
    try {
      const state = this.stateManager.getState();
      console.debug("--- init state ---")
      console.debug(JSON.stringify(state, null, 2));
      
      // Generate initial optional Question
      if (!this.stateManager.memory.currentQuestion) {
        const response = await this.generateOptionalQuestion();
        if (!response) {
          return null; // Will trigger transition to CONFIRMATION phase
        }
        return {
          answer: response.question,
          suggestions: ["Not applicable", "End optional questions and review"]
        };
      } else {
        // Handle "End optional questions" command
        if (keywordsForEnd.some(keyword => input.toLowerCase().includes(keyword))){
          this.stateManager.memory.currentPhase = Phase.CONFIRMATION;
          return null;
        }

        // Handle NA response
        if (keywordsForNA.some(keyword => input.toLowerCase().includes(keyword))) {
          // Store the full question object before clearing it
          const currentQuestionObj = {
            question: this.stateManager.memory.currentQuestion.question,
            category: this.stateManager.memory.currentQuestion.category
          };
          this.stateManager.memory.prevQuestions.push(currentQuestionObj);
          this.stateManager.setCurrentQuestion(null);
          
          const response = await this.generateOptionalQuestion();
          if (!response) {
            return null; // Will trigger transition to CONFIRMATION phase
          }
          return {
            answer: response.question,
            suggestions: ["Not applicable", "End optional questions and review"]
          };
        }

        // Validate user's input
        const prompt = validationPrompts.optionalValidation(
          input,
          this.stateManager.memory.currentQuestion
        );
        const validationResponse = await this.validationHandler.validateOptionalResponse(prompt);

        if (validationResponse.isValid){
          // Store the full question object before clearing it
          const currentQuestionObj = {
            question: this.stateManager.memory.currentQuestion.question,
            category: this.stateManager.memory.currentQuestion.category
          };
          this.stateManager.memory.prevQuestions.push(currentQuestionObj);
          this.stateManager.setCurrentQuestion(null);
          
          // Initialize additional_info as an object if it doesn't exist
          if (!this.stateManager.memory.currentDependent.additional_info) {
            this.stateManager.memory.currentDependent.additional_info = {};
          }
          // Add the new info directly with the key name
          this.stateManager.memory.currentDependent.additional_info[validationResponse.info.key] = validationResponse.info.value;
          
          const response = await this.generateOptionalQuestion();
          if (!response) {
            return null; // Will trigger transition to CONFIRMATION phase
          }
          return {
            answer: response.question,
            suggestions: ["Not applicable", "End optional questions and review"]
          };
        }
        else {
          return {
            answer: `Let's try this again. ${this.stateManager.memory.currentQuestion.question}`,
            hintMsg: validationResponse.reason,
            suggestions: ["Not applicable", "End optional questions and review"]
          }
        }
      }
    } catch (error) {
      console.error('Error in handleOptionalPhase:', error);
      throw error;
    }
  }
}

module.exports = OptionalQuestionHandler;
