const { Ollama } = require('ollama');
const initialPrompts = require('../prompts/initial_question_prompt');
const mandatoryPrompts = require('../prompts/mandatory_questions_prompt');
const optionalPrompts = require('../prompts/optional_questions_prompt');
const { getCachedUserProfile } = require('../../config/redis');

class CarpoolAgent {
  constructor() {
    this.reset();
    this.ollama = new Ollama();
  }

  reset() {
    this.currentState = {
      questionType: 'initial',
      collectedInfo: {},
      currentDependent: null
    };
  }

  async getFirstQuestion(userId) {
    try {
      // Get user profile from cache
      const userProfile = await getCachedUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get response from LLM
      const llmResponse = await this.ollama.generate({
        model: 'phi3:14b',
        prompt: initialPrompts.initQuestion(userProfile)
      });

      const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);

      // Parse LLM response and extract suggestions
      let suggestions = [];
      if (userProfile.dependent_information && userProfile.dependent_information.length > 0) {
        // Add existing dependents as suggestions
        suggestions = userProfile.dependent_information.map(dep => `Add activity for ${dep.name}`);
        suggestions.push('Add a new dependent');
      }

      return {
        answer: responseText,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Error in getFirstQuestion:', error);
      throw error;
    }
  }

  async handleFirstQuestionResponse(userId, response) {
    try {
      const userProfile = await getCachedUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Check if user wants to add activity for existing dependent
      const existingDependent = userProfile.dependent_information?.find(
        dep => response.toLowerCase().includes(dep.name.toLowerCase())
      );

      if (existingDependent) {
        this.currentState.currentDependent = {
          name: existingDependent.name,
          age: existingDependent.age,
          gender: existingDependent.gender,
          school: existingDependent.school
        };
      }

      // Transition to mandatory questions
      this.setQuestionType('mandatory');
      return this.getMandatoryQuestions(userId);
    } catch (error) {
      console.error('Error in handleFirstQuestionResponse:', error);
      throw error;
    }
  }

  async getMandatoryQuestions(userId) {
    try {
      const userProfile = await getCachedUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Create context for mandatory questions
      const profileContext = {
        ...userProfile,
        currentDependent: this.currentState.currentDependent,
        collectedInfo: this.currentState.collectedInfo
      };

      const llmResponse = await this.ollama.generate({
        model: 'phi3:14b',
        prompt: mandatoryPrompts.mandatoryQuestion(JSON.stringify(profileContext))
      });

      const responseText = typeof llmResponse === 'object' ? llmResponse.response : String(llmResponse);

      return {
        answer: responseText,
        suggestions: [] // Can be enhanced with dynamic suggestions based on context
      };
    } catch (error) {
      console.error('Error in getMandatoryQuestions:', error);
      throw error;
    }
  }

  setQuestionType(type) {
    if (!['initial', 'mandatory', 'optional'].includes(type)) {
      throw new Error('Invalid question type');
    }
    this.currentState.questionType = type;
  }

  updateCollectedInfo(info) {
    this.currentState.collectedInfo = {
      ...this.currentState.collectedInfo,
      ...info
    };
  }
}

module.exports = CarpoolAgent;
