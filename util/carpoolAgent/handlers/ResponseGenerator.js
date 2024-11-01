class ResponseGenerator {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  prepareConfirmation() {
    const state = this.stateManager.getState();
    let summary = "Here's a summary of your carpool profile:\n\n";
    
    if (state.userState.selectedChild) {
      summary += "Selected Child: " + state.userState.selectedChild.name + "\n\n";
    }
    
    // Mandatory information
    summary += "Required Information:\n";
    summary += Object.entries(state.profileData.mandatory)
      .map(([id, answer]) => {
        const question = state.currentQuestion?.find(q => q.id === id);
        return question ? `${question.question}\nYour answer: ${answer}` : '';
      })
      .filter(entry => entry)
      .join('\n\n');

    // Optional information
    if (Object.keys(state.profileData.optional).length > 0) {
      summary += "\n\nAdditional Information:\n";
      summary += Object.entries(state.profileData.optional)
        .map(([id, answer]) => `Question: ${id.split('_').slice(1).join(' ')}\nYour answer: ${answer}`)
        .join('\n\n');
    }

    summary += "\n\nIs all this information correct? (Yes/No)";

    return {
      answer: summary,
      suggestions: ["Yes, this is correct", "No, I need to make changes"],
      isProfileComplete: false
    };
  }

  generateCompletionResponse() {
    const state = this.stateManager.getState();
    return {
      answer: "Perfect! Your carpool profile is complete. Our system will match you with compatible families based on:\n" +
              "- Location and schedule compatibility\n" +
              "- Safety preferences\n" +
              "- Vehicle capacity\n" +
              (Object.keys(state.profileData.optional).length > 0 ? 
               "- Additional preferences you've provided\n" : "") +
              "\nYou'll receive notifications for potential matches!",
      suggestions: ["View potential matches", "Edit my profile"],
      isProfileComplete: true
    };
  }

  generateErrorResponse(question, validationReason) {
    return {
      answer: `Your answer needs more detail. ${validationReason}\n\nWhy this matters: ${question.importance}`,
      suggestions: question.followUp,
      isProfileComplete: false
    };
  }

  generateOptionalPhaseIntro() {
    return {
      answer: "Great! You've completed all required questions. Would you like to provide additional information to improve your carpool matching?",
      suggestions: ["Yes, I'd like to provide more information", "No, proceed to review my profile"],
      isProfileComplete: false
    };
  }
}

module.exports = ResponseGenerator;
