const { Ollama } = require('ollama');

class CarpoolProfileAgent {
  constructor() {
    this.ollama = new Ollama();
    
    // Memory System
    this.memory = {
      profileData: {},
      completedQuestions: new Set(),
      currentQuestion: null,
      validationAttempts: {},
      isConfirmationPhase: false
    };

    // Mandatory Questions with Validation Rules
    this.mandatoryQuestions = [
      {
        id: 'childrenInfo',
        question: "How many children do you need transportation for, and what are their ages?",
        validationPrompt: `Analyze if the user's answer contains both:
1. Number of children
2. Ages of children
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
        followUp: ["For example: '2 children, ages 8 and 10'"],
        importance: "This helps match you with appropriate carpool groups"
      },
      {
        id: 'schoolInfo',
        question: "Which school(s) do your children attend and what are their grade levels?",
        validationPrompt: `Analyze if the user's answer contains both:
1. School name(s)
2. Grade levels
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
        followUp: ["For example: 'Lincoln Elementary, 3rd and 5th grade'"],
        importance: "This helps match you with families from the same school"
      },
      {
        id: 'schedule',
        question: "What are your children's school schedules? Please include start and end times.",
        validationPrompt: `Analyze if the user's answer contains specific time information:
1. School start time
2. School end time
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
        followUp: ["For example: 'School starts at 8:30 AM and ends at 3:15 PM'"],
        importance: "This ensures compatible pickup and drop-off times"
      },
      {
        id: 'location',
        question: "What is your home address or neighborhood for pickup/drop-off?",
        validationPrompt: `Analyze if the user's answer contains specific location information:
1. Address or neighborhood name
2. Sufficient detail for location identification
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
        followUp: ["You can specify your neighborhood if you prefer"],
        importance: "This helps match you with nearby families"
      },
      {
        id: 'availability',
        question: "Which days of the week are you available to drive for the carpool?",
        validationPrompt: `Analyze if the user's answer contains specific weekdays they are available:
1. Mentions specific days of the week
2. Clear availability pattern
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
        followUp: ["For example: 'Available Monday, Wednesday, and Friday'"],
        importance: "This helps create a balanced carpool schedule"
      }
    ];
  }

  async validateAnswer(questionId, answer) {
    const question = this.mandatoryQuestions.find(q => q.id === questionId);
    if (!question) return { isValid: false, reason: "Question not found" };

    try {
      const response = await this.ollama.generate({
        model: 'llama2:3b',
        prompt: question.validationPrompt + answer
      });

      try {
        const validation = JSON.parse(response.response);
        return {
          isValid: validation.isValid,
          reason: validation.reason
        };
      } catch (parseError) {
        console.error('Error parsing validation response:', parseError);
        // Fallback validation if JSON parsing fails
        return {
          isValid: response.response.toLowerCase().includes('valid') && 
                  !response.response.toLowerCase().includes('not valid'),
          reason: "Based on general content analysis"
        };
      }
    } catch (error) {
      console.error('Error validating answer:', error);
      // Fallback to basic validation if model call fails
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

      // Handle current question validation if there's input
      if (this.memory.currentQuestion && input) {
        const validation = await this.validateAnswer(this.memory.currentQuestion, input);
        
        if (validation.isValid) {
          this.memory.profileData[this.memory.currentQuestion] = input;
          this.memory.completedQuestions.add(this.memory.currentQuestion);
          this.memory.currentQuestion = null;
        } else {
          this.memory.validationAttempts[this.memory.currentQuestion] = 
            (this.memory.validationAttempts[this.memory.currentQuestion] || 0) + 1;
          
          return {
            answer: `Your answer needs more detail. ${validation.reason}\n\nWhy this matters: ${
              this.mandatoryQuestions.find(q => q.id === this.memory.currentQuestion).importance
            }`,
            suggestions: this.mandatoryQuestions.find(q => q.id === this.memory.currentQuestion).followUp,
            isProfileComplete: false
          };
        }
      }

      // Find next unanswered question
      const nextQuestion = this.mandatoryQuestions.find(q => 
        !this.memory.completedQuestions.has(q.id)
      );

      // If all questions are answered, move to confirmation
      if (!nextQuestion) {
        if (!this.memory.isConfirmationPhase) {
          this.memory.isConfirmationPhase = true;
          return this.prepareConfirmation();
        }
      }

      // Set and ask next question
      if (nextQuestion) {
        this.memory.currentQuestion = nextQuestion.id;
        return {
          answer: `${nextQuestion.question}\n\nWhy this matters: ${nextQuestion.importance}`,
          suggestions: nextQuestion.followUp,
          isProfileComplete: false
        };
      }
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }

  prepareConfirmation() {
    const summary = this.mandatoryQuestions
      .map(q => {
        const answer = this.memory.profileData[q.id];
        return `${q.question}\nYour answer: ${answer}`;
      })
      .join('\n\n');

    return {
      answer: "Great! Let's review your profile information before finalizing:\n\n" +
              summary + "\n\n" +
              "Is all this information correct? (Yes/No)\n" +
              "If you need to make any changes, please say 'No'.",
      suggestions: ["Yes, this is correct", "No, I need to make changes"],
      isProfileComplete: false
    };
  }

  async handleConfirmation(input) {
    try {
      const response = await this.ollama.generate({
        model: 'llama2:3b',
        prompt: `Determine if the user's response is confirming or denying:
Input: "${input}"
Response format: { "isConfirming": boolean }
Consider "yes", "correct", "that's right" as confirmation and "no", "wrong", "incorrect" as denial.`
      });

      let isConfirming = false;
      try {
        const result = JSON.parse(response.response);
        isConfirming = result.isConfirming;
      } catch (parseError) {
        // Fallback if JSON parsing fails
        isConfirming = input.toLowerCase().includes('yes') || 
                      input.toLowerCase().includes('correct') ||
                      input.toLowerCase().includes('right');
      }

      if (isConfirming) {
        return {
          answer: "Perfect! Your carpool profile is now complete. Our system will start matching you with compatible families based on:\n" +
                  "- Location proximity\n" +
                  "- School and schedule compatibility\n" +
                  "- Vehicle capacity and safety preferences\n\n" +
                  "You'll receive notifications when potential matches are found!",
          suggestions: ["View potential matches", "Edit my profile"],
          isProfileComplete: true
        };
      } else {
        this.memory.isConfirmationPhase = false;
        this.memory.completedQuestions.clear();
        this.memory.currentQuestion = null;
        this.memory.profileData = {};
        
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
    this.memory.profileData = {};
    this.memory.completedQuestions.clear();
    this.memory.currentQuestion = null;
    this.memory.validationAttempts = {};
    this.memory.isConfirmationPhase = false;
  }
}

// Create agent instance
const carpoolAgent = new CarpoolProfileAgent();

// Export interface functions
async function generateResponse(prompt) {
  return carpoolAgent.generateResponse(prompt);
}

function resetProfile() {
  carpoolAgent.reset();
}

module.exports = { generateResponse, resetProfile };
