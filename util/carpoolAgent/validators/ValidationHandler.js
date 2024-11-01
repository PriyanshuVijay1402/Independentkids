const { Ollama } = require('ollama');

class ValidationHandler {
  constructor() {
    this.ollama = new Ollama();
  }

  async validateAnswer(question, answer, existingChildren = []) {
    try {
      // Skip validation for "not applicable" responses to optional questions
      if (question.id.startsWith('optional_') && answer.toLowerCase() === 'not applicable') {
        return { isValid: true, reason: "Question skipped as not applicable" };
      }

      if (!question) {
        // For optional questions, basic validation
        return { isValid: answer.length >= 5, reason: "Optional question answered" };
      }

      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: question.validationPrompt + answer
      });

      try {
        const validation = JSON.parse(response.response);
        
        // Special handling for kidSelection validation
        if (question.id === 'kidSelection') {
          const isNewKid = answer.toLowerCase() === 'new';
          if (isNewKid) {
            validation.selectedChild = null;
          } else {
            const selectedChild = existingChildren.find(
              child => child.name.toLowerCase() === answer.toLowerCase()
            );
            if (selectedChild) {
              validation.selectedChild = selectedChild;
            } else {
              return { isValid: false, reason: "Selected child not found in existing profiles" };
            }
          }
        }
        
        return validation;
      } catch (parseError) {
        console.error('Error parsing validation response:', parseError);
        return {
          isValid: response.response.toLowerCase().includes('valid'),
          reason: "Based on content analysis"
        };
      }
    } catch (error) {
      console.error('Error in validateAnswer:', error);
      return {
        isValid: answer.length >= 10,
        reason: "Basic length validation (fallback)"
      };
    }
  }

  async validateConfirmation(input) {
    try {
      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt: `Determine if this is a confirmation: "${input}"
Response format: { "isConfirming": boolean }
Consider "yes", "correct", "right" as confirmation.`
      });

      try {
        const result = JSON.parse(response.response);
        return result.isConfirming;
      } catch (parseError) {
        console.error('Error parsing confirmation response:', parseError);
        return input.toLowerCase().includes('yes');
      }
    } catch (error) {
      console.error('Error in validateConfirmation:', error);
      return false;
    }
  }
}

module.exports = ValidationHandler;
