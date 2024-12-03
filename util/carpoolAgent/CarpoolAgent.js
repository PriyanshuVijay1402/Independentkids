const StateManager = require('./StateManager');
const InitialQuestionHandler = require('./InitialQuestionHandler');
const MandatoryQuestionHandler = require('./MandatoryQuestionHandler');
const OptionalQuestionHandler = require('./OptionalQuestionHandler');
const Phase = require('../vars/stateEnum');
const { assembleDependent } = require('../utils');
const { updateCachedDependent, cacheCurrentDependentActivity } = require('../../config/redis');

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
        const dependent = await assembleDependent(this.stateManager);
        await updateCachedDependent(this.stateManager.user, dependent);

        // Cache the current dependent and activity for matching
        const currentDependent = this.stateManager.memory.currentDependent;
        if (currentDependent.basic && currentDependent.activity) {
          await cacheCurrentDependentActivity(
            this.stateManager.user,
            currentDependent.basic.name,
            currentDependent.activity.name
          );
        }

        return {
          answer: `👍 We are all set.`,
          info: dependent,
          isProfileComplete: true
        };
      }
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }
}

module.exports = CarpoolAgent;
