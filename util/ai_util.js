const { Ollama } = require('ollama');
const { mandatoryQuestions } = require('./ai_vars');

class CarpoolProfileAgent {
  constructor() {
    this.ollama = new Ollama();
    
    // Memory System
    this.memory = {
      profileData: {
        mandatory: {},
        optional: {}
      },
      completedQuestions: new Set(),
      currentQuestion: null,
      validationAttempts: {},
      isConfirmationPhase: false,
      isOptionalPhase: false,
      currentOptionalQuestion: null
    };

    // Reference to mandatory questions
    this.mandatoryQuestions = mandatoryQuestions;
  }

  async generateOptionalQuestion() {
    try {
      const profileContext = JSON.stringify({
        mandatory: this.memory.profileData.mandatory,
        optional: this.memory.profileData.optional
      });

      const prompt = `As a carpool matching assistant, generate a relevant follow-up question based on this profile:
      ${profileContext}
      
      Requirements:
      1. Question should be specific to carpooling needs
      2. Don't repeat information already provided
      3. Focus on practical aspects that could improve carpool matching
      4. Consider safety, convenience, and compatibility factors
      
      Response format:
      {
        "question": "your question here",
        "category": "one of: preferences, vehicle, safety, schedule, communication"
      }`;

      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: prompt
      });

      // Fallback question if parsing fails
      const fallbackQuestion = {
        id: 'optional_' + Date.now(),
        question: "Do you have any additional preferences or requirements for the carpool arrangement?",
        importance: "This helps us better understand your specific needs"
      };

      try {
        // Try to extract JSON using regex
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

  async validateAnswer(questionId, answer) {
    // Skip validation for "not applicable" responses to optional questions
    if (questionId.startsWith('optional_') && answer.toLowerCase() === 'not applicable') {
      return { isValid: true, reason: "Question skipped as not applicable" };
    }

    const question = this.mandatoryQuestions.find(q => q.id === questionId);
    if (!question) {
      // For optional questions, basic validation
      return { isValid: answer.length >= 5, reason: "Optional question answered" };
    }

    try {
      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: question.validationPrompt + answer
      });

      try {
        const validation = JSON.parse(response.response);
        return validation;
      } catch (parseError) {
        return {
          isValid: response.response.toLowerCase().includes('valid'),
          reason: "Based on content analysis"
        };
      }
    } catch (error) {
      console.error('Error validating answer:', error);
      return {
        isValid: answer.length >= 10,
        reason: "Basic length validation (fallback)"
      };
    }
  }

  async generateResponse(input) {
    try {
      // Handle confirmation phase
      if (this.memory.isConfirmationPhase) {
        return this.handleConfirmation(input);
      }

      // Handle optional phase
      if (this.memory.isOptionalPhase) {
        return this.handleOptionalPhase(input);
      }

      // Handle current question validation
      if (this.memory.currentQuestion && input) {
        const validation = await this.validateAnswer(this.memory.currentQuestion, input);
        
        if (validation.isValid) {
          this.memory.profileData.mandatory[this.memory.currentQuestion] = input;
          this.memory.completedQuestions.add(this.memory.currentQuestion);
          this.memory.currentQuestion = null;
        } else {
          return {
            answer: `Your answer needs more detail. ${validation.reason}\n\nWhy this matters: ${
              this.mandatoryQuestions.find(q => q.id === this.memory.currentQuestion).importance
            }`,
            suggestions: this.mandatoryQuestions.find(q => q.id === this.memory.currentQuestion).followUp,
            isProfileComplete: false
          };
        }
      }

      // Find next mandatory question
      const nextQuestion = this.mandatoryQuestions.find(q => 
        !this.memory.completedQuestions.has(q.id)
      );

      // If all mandatory questions are answered, start optional phase
      if (!nextQuestion) {
        this.memory.isOptionalPhase = true;
        return {
          answer: "Great! You've completed all required questions. Would you like to provide additional information to improve your carpool matching?",
          suggestions: ["Yes, I'd like to provide more information", "No, proceed to review my profile"],
          isProfileComplete: false
        };
      }

      // Ask next mandatory question
      this.memory.currentQuestion = nextQuestion.id;
      return {
        answer: `${nextQuestion.question}\n\nWhy this matters: ${nextQuestion.importance}`,
        suggestions: nextQuestion.followUp,
        isProfileComplete: false
      };
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }

  async handleOptionalPhase(input) {
    // Handle "End optional questions" command
    if (input.toLowerCase().includes('end optional questions')) {
      this.memory.isOptionalPhase = false;
      this.memory.isConfirmationPhase = true;
      return this.prepareConfirmation();
    }

    // If there's a current optional question, handle the answer and generate next question
    if (this.memory.currentOptionalQuestion) {
      if (input.toLowerCase() === 'not applicable') {
        this.memory.profileData.optional[this.memory.currentOptionalQuestion.id] = 'Not applicable';
      } else {
        this.memory.profileData.optional[this.memory.currentOptionalQuestion.id] = input;
      }
      
      const nextQuestion = await this.generateOptionalQuestion();
      if (nextQuestion) {
        this.memory.currentOptionalQuestion = nextQuestion;
        return {
          answer: `${nextQuestion.question}\n\nYou can answer the question or type 'not applicable' to skip.`,
          suggestions: ["Not applicable", "End optional questions and review"],
          isProfileComplete: false
        };
      }
    }

    // Handle initial "yes" to start optional questions
    if (input.toLowerCase().includes('yes')) {
      const optionalQuestion = await this.generateOptionalQuestion();
      if (optionalQuestion) {
        this.memory.currentOptionalQuestion = optionalQuestion;
        return {
          answer: `${optionalQuestion.question}\n\nYou can answer the question or type 'not applicable' to skip.`,
          suggestions: ["Not applicable", "End optional questions and review"],
          isProfileComplete: false
        };
      }
    }

    // If we reach here (no question generated or "no" selected), move to confirmation
    this.memory.isOptionalPhase = false;
    this.memory.isConfirmationPhase = true;
    return this.prepareConfirmation();
  }

  prepareConfirmation() {
    let summary = "Here's a summary of your carpool profile:\n\n";
    
    // Mandatory information
    summary += "Required Information:\n";
    summary += Object.entries(this.memory.profileData.mandatory)
      .map(([id, answer]) => {
        const question = this.mandatoryQuestions.find(q => q.id === id);
        return `${question.question}\nYour answer: ${answer}`;
      })
      .join('\n\n');

    // Optional information
    if (Object.keys(this.memory.profileData.optional).length > 0) {
      summary += "\n\nAdditional Information:\n";
      summary += Object.entries(this.memory.profileData.optional)
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

  async handleConfirmation(input) {
    try {
      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: `Determine if this is a confirmation: "${input}"
Response format: { "isConfirming": boolean }
Consider "yes", "correct", "right" as confirmation.`
      });

      let isConfirming = false;
      try {
        const result = JSON.parse(response.response);
        isConfirming = result.isConfirming;
      } catch (parseError) {
        isConfirming = input.toLowerCase().includes('yes');
      }

      if (isConfirming) {
        return {
          answer: "Perfect! Your carpool profile is complete. Our system will match you with compatible families based on:\n" +
                  "- Location and schedule compatibility\n" +
                  "- Safety preferences\n" +
                  "- Vehicle capacity\n" +
                  (Object.keys(this.memory.profileData.optional).length > 0 ? 
                   "- Additional preferences you've provided\n" : "") +
                  "\nYou'll receive notifications for potential matches!",
          suggestions: ["View potential matches", "Edit my profile"],
          isProfileComplete: true
        };
      } else {
        this.reset();
        return {
          answer: "No problem! Let's start over to ensure your profile is exactly right.\n\n" +
                  this.mandatoryQuestions[0].question,
          suggestions: this.mandatoryQuestions[0].followUp,
          isProfileComplete: false
        };
      }
    } catch (error) {
      console.error('Error in handleConfirmation:', error);
      throw error;
    }
  }

  reset() {
    this.memory = {
      profileData: {
        mandatory: {},
        optional: {}
      },
      completedQuestions: new Set(),
      currentQuestion: null,
      validationAttempts: {},
      isConfirmationPhase: false,
      isOptionalPhase: false,
      currentOptionalQuestion: null
    };
  }

  getFirstQuestion() {
    const firstQuestion = this.mandatoryQuestions[0];
    this.memory.currentQuestion = firstQuestion.id;
    return {
      answer: `${firstQuestion.question}\n\nWhy this matters: ${firstQuestion.importance}`,
      suggestions: firstQuestion.followUp,
      isProfileComplete: false
    };
  }
}

module.exports = CarpoolProfileAgent;
