const { getCachedUserProfile } = require('../../config/redis');
const Phase = require('../vars/stateEnum');

class StateManager {
  constructor(userId) {
    this.user = userId;
    this.userProfile = null;
    this.memory = {
      currentPhase: Phase.INITIAL,
      currentDependent: null,
      currentQuestion: null,
      currentSuggestion: null
    };
    userId && this.setUserProfile();
  }

  async setUserProfile() {
    try {
      if (!this.user) {
        throw new Error('UserId not provided');
      }
      this.userProfile = await getCachedUserProfile(this.user);
      if (!this.userProfile) {
        throw new Error('User profile not found');
      }
      return true;
    } catch (error) {
      console.error('Error updating user profile in StateManager:', error);
      throw error;
    }
  }

  setCurrentPhase(newPhase) {
    if (Object.values(Phase).includes(newPhase)) {
      this.memory.currentPhase = newPhase;
    } else {
      throw new Error('Invalid phase');
    }
  }

  getCurrentPhase(){
    return this.memory.currentPhase;
  }

  setCurrentQuestion(question) {
    this.memory.currentQuestion = question;
  }

  getCurrentQuestion() {
    return this.memory.currentQuestion;
  }

  setCurrentSuggestion(suggestion) {
    this.memory.currentSuggestion = suggestion;
  }

  getCurrentSuggestion() {
    return this.memory.currentSuggestion;
  }

  setCurrentDependent(dependent) {
    this.memory.currentDependent = dependent;
  }

  getCurrentDependent() {
    return this.memory.currentDependent;
  }

  getState() {
    return this.memory;
  }

  getProfile() {
    return this.userProfile;
  }
}

module.exports = StateManager;
