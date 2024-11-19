const prompts = {
  optionalQuestion: (profileContext) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);

    return `As a friendly carpool coordinator, review this dependent's profile and identify any helpful additional information we might need.

Profile Context:
${profileContextString}

Instructions:
1. Review these important aspects of the profile:
   - Safety and emergency details
   - Medical needs
   - Behavioral considerations
   - Comfort preferences
   - Special accommodations

2. Check for information that would help us better support the dependent, focusing on general categories:
   - Health and safety considerations
   - Comfort and accommodation needs
   - Behavioral and social preferences
   - Special instructions or requirements

3. Output format:
   Return a JSON object:
   {
     "question": "A friendly question asking about general categories of information, like: 'Would you have any specific needs regarding [comfort preferences], [special accommodations], or [other relevant aspects] that would help us ensure a better carpool experience?'",
     "hints": [
       "General categories of information to consider",
       "Example: 'comfort needs', 'special requirements', 'general preferences'"
     ],
     "hintMsg": "A concise explanation of why these details matter, like: 'Understanding these preferences helps us ensure a safe and comfortable ride by [specific benefit] and [specific benefit]'"
   }

4. If profile is complete:
   {
     "question": "Thank you! We have all the information we need for a safe and comfortable carpool experience",
     "hints": [],
     "hintMsg": ""
   }

Generate only the JSON response based on these guidelines, no additional text.`;
  }
};

module.exports = prompts;
