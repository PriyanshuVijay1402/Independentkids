const { getMandatoryQuestions, initialQuestion } = require('../../ai_vars');

class QuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.currentQuestions = this.initializeQuestions();
  }

  initializeQuestions() {
    const state = this.stateManager.getState();
    return state.userState.hasExistingChildren ? 
      [initialQuestion] : 
      getMandatoryQuestions(state.userState);
  }

  updateQuestions() {
    const state = this.stateManager.getState();
    this.currentQuestions = getMandatoryQuestions(state.userState);
  }

  getNextQuestion() {
    const state = this.stateManager.getState();
    return this.currentQuestions.find(q => 
      !state.completedQuestions.has(q.id)
    );
  }

  getCurrentQuestion() {
    const state = this.stateManager.getState();
    return this.currentQuestions.find(q => q.id === state.currentQuestion);
  }

  formatQuestionResponse(question) {
    if (!question) return null;

    if (this.stateManager.getState().userState.hasExistingChildren && 
        question.id === 'kidSelection') {
      const existingNames = this.stateManager.getState().userState.existingChildren
        .map(child => child.name)
        .join(', ');
      
      return {
        answer: `Would you like to find a carpool for one of your existing children (${existingNames}) or add a new child? Type a child's name or 'new' for a new child.\n\nWhy this matters: ${question.importance}`,
        suggestions: [
          ...this.stateManager.getState().userState.existingChildren.map(child => child.name),
          'new'
        ],
        isProfileComplete: false
      };
    }

    return {
      answer: `${question.question}\n\nWhy this matters: ${question.importance}`,
      suggestions: question.followUp,
      isProfileComplete: false
    };
  }

  getFirstQuestion() {
    const firstQuestion = this.currentQuestions[0];
    this.stateManager.setCurrentQuestion(firstQuestion.id);
    return this.formatQuestionResponse(firstQuestion);
  }
}

module.exports = QuestionHandler;
