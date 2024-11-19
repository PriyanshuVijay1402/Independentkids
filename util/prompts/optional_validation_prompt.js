const prompts = {
  optionalValidation: (input, context, profile) => {
    return `You are a carpool matching assistant performing information extraction. Analyze the following:

USER'S RESPONSE: "${input}"
ORIGINAL QUESTION: "${context.question}"
USER'S PROFILE: "${profile}"

EXTRACTION RULES:
1. INFORMATION EXTRACTION
- Extract ONLY NEW relevant key:value points from the response
- DO NOT extract information if the same or similar key/value already exists in the profile
- Each point MUST be related to carpooling context (needs, arrangements, schedules, etc.)
- Each point MUST reasonably connect to the original question
- Ignore content that is:
  * Already present in the profile (same or similar meaning)
  * Unrelated to carpooling
  * Not relevant to the question asked
  * Not providing meaningful information

2. DUPLICATE CHECKING
- Before adding any key:value pair, check if:
  * The exact same information exists in the profile
  * A similar key with equivalent meaning exists (e.g., "seating_preference" vs "seat_preference")
  * The value provides the same information in different words
- Skip extraction if the information is redundant

3. FORMAT REQUIREMENTS
- Input should be in natural language
- Not empty or only special characters
- Reasonable length (1-200 characters)

Output format MUST be a JSON object:
{
  "isValid": boolean, // false if no NEW relevant carpool information could be extracted
  "info": { // Object containing ONLY NEW extracted key:value pairs
    "key1": "value1",
    "key2": "value2",
    ...
  },
  "ignoredReason": string | null // Explain what was ignored and why (including duplicates), null if nothing ignored
}

Example validations:
1. Profile: {"allergy": "peanuts"}
   Q: "Would you like to share about any medical needs?"
   A: "He's allergic to peanuts and needs to sit by the window"
   Response: {
     "isValid": true,
     "info": {
       "seat_preference": "window"
     },
     "reason": "Ignored peanut allergy as it's already in profile"
   }

2. Profile: {"environment_preference": "quiet"}
   Q: "Any specific needs during the carpool ride?"
   A: "Needs quiet environment and booster seat"
   Response: {
     "isValid": true,
     "info": {
       "equipment_need": "booster seat"
     },
     "reason": "Ignored quiet environment preference as it's already in profile"
   }

3. Q: "Any preferences for the carpool arrangement?"
   A: "xyz123!!!"
   Response: {
     "isValid": false,
     "info": {},
     "reason": "No meaningful carpool-related information provided"
   }

Do not include any other text, explanation, or formatting in your response.`;
  }
};

module.exports = prompts;
