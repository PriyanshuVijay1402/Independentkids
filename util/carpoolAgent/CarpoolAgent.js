const StateManager = require('./state/StateManager');
const ValidationHandler = require('./validators/ValidationHandler');
const QuestionHandler = require('./handlers/QuestionHandler');
const OptionalQuestionHandler = require('./handlers/OptionalQuestionHandler');
const ResponseGenerator = require('./handlers/ResponseGenerator');

class CarpoolAgent {
  constructor(existingUserData = null) {
    this.stateManager = new StateManager(existingUserData);
    this.validationHandler = new ValidationHandler();
    this.questionHandler = new QuestionHandler(this.stateManager);
    this.optionalQuestionHandler = new OptionalQuestionHandler(this.stateManager);
    this.responseGenerator = new ResponseGenerator(this.stateManager);
  }

  async generateResponse(input) {
    try {
      const state = this.stateManager.getState();

      // Handle confirmation phase
      if (state.isConfirmationPhase) {
        return this.handleConfirmation(input);
      }

      // Handle optional phase
      if (state.isOptionalPhase) {
        const optionalResponse = await this.optionalQuestionHandler.handleOptionalPhase(input);
        if (optionalResponse) return optionalResponse;
        return this.responseGenerator.prepareConfirmation();
      }

      // Handle current question validation
      if (state.currentQuestion && input) {
        const currentQuestion = this.questionHandler.getCurrentQuestion();
        const validation = await this.validationHandler.validateAnswer(
          currentQuestion, 
          input,
          state.userState.existingChildren
        );
        
        if (validation.isValid) {
          this.stateManager.markQuestionCompleted(state.currentQuestion, input);
          this.stateManager.setCurrentQuestion(null);

          if (validation.selectedChild !== undefined) {
            this.stateManager.updateSelectedChild(validation.selectedChild);
            this.questionHandler.updateQuestions();
          }
        } else {
          return this.responseGenerator.generateErrorResponse(currentQuestion, validation.reason);
        }
      }

      // Find next question
      const nextQuestion = this.questionHandler.getNextQuestion();

      // If all current questions are answered, move to optional phase
      if (!nextQuestion) {
        this.stateManager.startOptionalPhase();
        return this.responseGenerator.generateOptionalPhaseIntro();
      }

      // Ask next question
      this.stateManager.setCurrentQuestion(nextQuestion.id);
      return this.questionHandler.formatQuestionResponse(nextQuestion);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }

  async handleConfirmation(input) {
    const isConfirming = await this.validationHandler.validateConfirmation(input);

    if (isConfirming) {
      return this.responseGenerator.generateCompletionResponse();
    } else {
      this.reset();
      return this.getFirstQuestion();
    }
  }

  reset() {
    this.stateManager.reset();
    this.questionHandler = new QuestionHandler(this.stateManager);
  }

  getFirstQuestion() {
    return this.questionHandler.getFirstQuestion();
  }
}

module.exports = CarpoolAgent;
