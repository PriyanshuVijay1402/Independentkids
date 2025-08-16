const prompts = {
  optionalQuestion: (profileContext) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);

    return `As a friendly carpool coordinator, analyze this dependent's profile to identify specific missing information that could affect the carpool experience.

Profile Context:
${profileContextString}

Instructions:
1. First, analyze the existing profile data for these critical categories:
   - Safety and emergency details
     * Emergency protocols
     * Medical conditions
     * Allergies
     * Required medications
   - Comfort and accommodation needs
     * Seating preferences
     * Temperature sensitivity
     * Motion sickness history
   - Behavioral considerations
     * Communication preferences
     * Anxiety triggers
     * Social interaction comfort level
   - Special requirements
     * Mobility assistance
     * Schedule constraints
     * Pick-up/drop-off protocols

2. Identify specific gaps by comparing existing data against these requirements:
   - Required fields: emergency contacts, medical conditions, pick-up/drop-off details
   - Recommended fields: comfort preferences, behavioral considerations
   - Optional but valuable: special accommodations, general preferences

3. Output format:
   Return a JSON object:
   {
     "question": "A specific question addressing the most critical missing information, e.g., 'I notice we don't have information about [specific missing detail]. Would you please share any [medical conditions/comfort needs/behavioral considerations] we should be aware of to ensure a safe journey?'",

     "hints": [
       "List specific missing fields that need attention",
       "Prioritize safety-critical information first",
       "Include related fields that might be relevant"
     ],

     "hintMsg": "A clear explanation of potential impacts, e.g., 'Without information about [specific missing detail], we may not be able to [specific consequence] or ensure [specific safety/comfort aspect]. This could affect [specific aspect of the carpool experience].'"
   }

4. If profile meets minimum safety requirements but has optional gaps:
   {
     "question": "While we have the essential safety information, knowing about [specific optional detail] would help us provide an even better experience. Would you like to share any details about this?",
     "hints": ["List of beneficial but optional information"],
     "hintMsg": "Explanation of how additional information would enhance the experience"
   }

5. If profile is fully complete:
   {
     "question": "Thank you! We have all the information we need for a safe and comfortable carpool experience",
     "hints": [],
     "hintMsg": ""
   }

Generate only the JSON response based on these guidelines, no additional text. Ensure the response highlights specific gaps in the current profile and their direct implications for the carpool service.`;
  }
};

module.exports = prompts;