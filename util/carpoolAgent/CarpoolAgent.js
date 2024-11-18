const StateManager = require('./StateManager');
const InitialQuestionHandler = require('./InitialQuestionHandler');
const MandatoryQuestionHandler = require('./MandatoryQuestionHandler');
const OptionalQuestionHandler = require('./OptionalQuestionHandler');
const Phase = require('../vars/stateEnum');

class CarpoolAgent {
  constructor(userId) {
    this.stateManager = new StateManager(userId);
    this.initialQuestionHandler = new InitialQuestionHandler(this.stateManager);
    this.mandatoryQuestionHandler = new MandatoryQuestionHandler(this.stateManager);
    this.optionalQuestionHandler = new OptionalQuestionHandler(this.stateManager);
  }

  // Reset the agent state
  reset() {
    this.stateManager = new StateManager(this.stateManager.userId);
    this.initialQuestionHandler = new InitialQuestionHandler(this.stateManager);
  }

  async generateResponse(input) {
    try {
      // Handle Initial Phase
      if (this.stateManager.getCurrentPhase() === Phase.INITIAL) {
        const llmResponse = await this.initialQuestionHandler.handleInitialPhase(input);
        if (llmResponse) return llmResponse;
      }

      if (this.stateManager.getCurrentPhase() === Phase.MANDATORY) {
        const llmResponse = await this.mandatoryQuestionHandler.handleMandatoryPhase(input);
        if (llmResponse) return llmResponse;
      }

      if (this.stateManager.getCurrentPhase() === Phase.OPTIONAL) {
        const llmResponse = await this.optionalQuestionHandler.handleOptionalPhase(input);
        if (llmResponse) return llmResponse;
      }
      if (this.stateManager.getCurrentPhase() === Phase.CONFIRMATION) {
        return {
          answer: `👍 We are all set.`,
          info: {
            basic: this.stateManager.memory.currentDependent.basic,
            school: this.stateManager.memory.currentDependent.school,
            activity: this.stateManager.memory.currentDependent.activity,
            preference: this.stateManager.memory.currentDependent.preference,
            schedule: this.stateManager.memory.currentDependent.schedule,
            additional_info: this.stateManager.memory.currentDependent.additional_info
          }
        };
      }
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }
}

module.exports = CarpoolAgent;
