const { Ollama } = require('ollama');
const prompts = require('../../ai_prompt_eng');

class OptionalQuestionHandler {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.ollama = new Ollama();
  }

  async generateOptionalQuestion() {
    try {
      const state = this.stateManager.getState();
      const profileContext = JSON.stringify({
        mandatory: state.profileData.mandatory,
        optional: state.profileData.optional
      });

      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: prompts.optionalQuestion(profileContext)
      });

      // Fallback question if parsing fails
      const fallbackQuestion = {
        id: 'optional_' + Date.now(),
        question: "Do you have any additional preferences or requirements for the carpool arrangement?",
        importance: "This helps us better understand your specific needs"
      };

      try {
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallbackQuestion;

        const result = JSON.parse(jsonMatch[0]);
        return {
          id: 'optional_' + Date.now(),
          question: result.question || fallbackQuestion.question,
          importance: result.importance || fallbackQuestion.importance
        };
      } catch (parseError) {
        console.error('Error parsing optional question:', parseError);
        return fallbackQuestion;
      }
    } catch (error) {
      console.error('Error generating optional question:', error);
      return {
        id: 'optional_' + Date.now(),
        question: "Do you have any additional preferences or requirements for the carpool arrangement?",
        importance: "This helps us better understand your specific needs"
      };
    }
  }

  async handleOptionalPhase(input) {
    try {
      const state = this.stateManager.getState();

      // Handle "End optional questions" command
      if (input.toLowerCase().includes('end optional questions')) {
        this.stateManager.startConfirmationPhase();
        return null;
      }

      // If there's a current optional question, handle the answer
      if (state.currentOptionalQuestion) {
        const answer = input.toLowerCase() === 'not applicable' ? 'Not applicable' : input;
        this.stateManager.markOptionalQuestionCompleted(state.currentOptionalQuestion.id, answer);
      }

      // Generate next question if user wants to continue
      if (input.toLowerCase().includes('yes') || state.currentOptionalQuestion) {
        const nextQuestion = await this.generateOptionalQuestion();
        if (nextQuestion) {
          this.stateManager.setCurrentOptionalQuestion(nextQuestion);
          return {
            answer: `${nextQuestion.question}\n\nYou can answer the question or type 'not applicable' to skip.`,
            suggestions: ["Not applicable", "End optional questions and review"],
            isProfileComplete: false
          };
        }
      }

      // If we reach here, move to confirmation
      this.stateManager.startConfirmationPhase();
      return null;
    } catch (error) {
      console.error('Error in handleOptionalPhase:', error);
      throw error;
    }
  }
}

module.exports = OptionalQuestionHandler;
