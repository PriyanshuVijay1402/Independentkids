class StateManager {
  constructor(existingUserData = null) {
    this.memory = {
      profileData: {
        mandatory: {},
        optional: {},
        selectedChild: null
      },
      completedQuestions: new Set(),
      currentQuestion: null,
      validationAttempts: {},
      isConfirmationPhase: false,
      isOptionalPhase: false,
      currentOptionalQuestion: null,
      userState: {
        hasExistingChildren: existingUserData?.dependent_information?.length > 0 || false,
        existingChildren: existingUserData?.dependent_information || [],
        selectedChild: null
      }
    };
  }

  updateSelectedChild(child) {
    this.memory.userState.selectedChild = child;
  }

  markQuestionCompleted(questionId, answer) {
    this.memory.profileData.mandatory[questionId] = answer;
    this.memory.completedQuestions.add(questionId);
  }

  markOptionalQuestionCompleted(questionId, answer) {
    this.memory.profileData.optional[questionId] = answer;
  }

  setCurrentQuestion(questionId) {
    this.memory.currentQuestion = questionId;
  }

  setCurrentOptionalQuestion(question) {
    this.memory.currentOptionalQuestion = question;
  }

  startOptionalPhase() {
    this.memory.isOptionalPhase = true;
  }

  startConfirmationPhase() {
    this.memory.isOptionalPhase = false;
    this.memory.isConfirmationPhase = true;
  }

  reset() {
    const existingUserData = {
      dependent_information: this.memory.userState.existingChildren
    };
    this.memory = {
      profileData: {
        mandatory: {},
        optional: {},
        selectedChild: null
      },
      completedQuestions: new Set(),
      currentQuestion: null,
      validationAttempts: {},
      isConfirmationPhase: false,
      isOptionalPhase: false,
      currentOptionalQuestion: null,
      userState: {
        hasExistingChildren: existingUserData?.dependent_information?.length > 0 || false,
        existingChildren: existingUserData?.dependent_information || [],
        selectedChild: null
      }
    };
  }

  getState() {
    return this.memory;
  }
}

module.exports = StateManager;
