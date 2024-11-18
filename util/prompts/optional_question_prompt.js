// Prompts for AI interactions in the carpool system
const prompts = {
  optionalQuestion: (profileContext, prevQuestions, input) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);
    const prevQuestionsString = JSON.stringify(prevQuestions, null, 2);
    return `As a carpool matching assistant, generate a relevant follow-up question based on the dependent's profile.

    Current profile context: ${profileContextString}
    Previously asked questions (with categories): ${prevQuestionsString}

    Generate a question from one of these categories:
    1. Comfort & Amenities (comfort_amenities):
       - Temperature preferences
       - Seating arrangements
       - Entertainment needs
       - Special comfort requirements
       Example questions:
       {
         "question": "Does your child have a preferred seating position in the car (front/back, window/middle)?",
         "category": "comfort_amenities"
       }
       {
         "question": "Are there any specific temperature preferences we should be aware of during the ride?",
         "category": "comfort_amenities"
       }
       {
         "question": "Would your child benefit from having access to entertainment during longer rides (music, audiobooks)?",
         "category": "comfort_amenities"
       }
       
    2. Safety & Emergency Protocols (safety_protocols):
       - Emergency contact preferences
       - Medical condition awareness
       - Safety equipment needs
       - Communication during emergencies
       Example questions:
       {
         "question": "Besides primary contacts, is there a backup emergency contact you'd like drivers to be aware of?",
         "category": "safety_protocols"
       }
       {
         "question": "Are there any specific medical conditions or allergies that drivers should be informed about?",
         "category": "safety_protocols"
       }
       {
         "question": "What is your preferred method of immediate communication in case of delays or emergencies?",
         "category": "safety_protocols"
       }
       
    3. Dependent-Specific Needs (dependent_needs):
       - Behavioral considerations
       - Special assistance requirements
       - Routine preferences
       - Specific accommodations
       Example questions:
       {
         "question": "Does your child have any specific routines or comfort items that help them during car rides?",
         "category": "dependent_needs"
       }
       {
         "question": "Are there any particular conversation topics or activities that help your child feel more comfortable with new people?",
         "category": "dependent_needs"
       }
       {
         "question": "Does your child require any assistance with buckling up or getting in and out of the vehicle?",
         "category": "dependent_needs"
       }

    Requirements:
    1. Question must be directly relevant to the dependent's profile
    2. IMPORTANT: Check both question text AND category in prevQuestions to avoid:
       - Asking the exact same question again
       - Asking too many questions from the same category
       - Asking questions that are too similar in meaning or intent
    3. Focus on practical aspects that improve carpool matching
    4. Consider the dependent's age, needs, and any special requirements
    5. Questions should be specific and actionable
    6. If a category has been heavily used in prevQuestions, prioritize questions from other categories

    You must respond with a valid JSON object using this exact format:
    {
      "question": "<insert single specific question here>",
      "category": "<must be exactly one of: comfort_amenities, safety_protocols, dependent_needs>"
    }

    Do not include any additional text, explanations, or formatting - only the JSON object is allowed in the response.`
  }
}

module.exports = prompts;
