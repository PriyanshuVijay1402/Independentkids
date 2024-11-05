// Prompts for AI interactions in the carpool system

const prompts = {
  basicQuestion: (profileContext, input) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);
    return `You are a carpool assistant collecting basic dependent information. Analyze this profile:
${profileContextString}

PROFILE REQUIREMENTS:
- Required fields: name (must not be null and must include first and last name)
- Optional fields: age (number), gender (string), grade (number)

TASK:
1. Extract ALL information from user input: ${input}
   - Extract name directly mentioned
   - Extract age from any number references
   - Extract gender from pronouns (he/him = Male, she/her = Female) or relationship words (son = Male, daughter = Female)
   - Extract grade if mentioned
2. Compare with existing profile and update accordingly
3. Return ONLY a JSON response with no additional text

VALIDATION RULES:
- Name must be a full name (first and last)
- Age must be a number if provided
- Gender must be "Male" or "Female" if provided
- Grade must be a number if provided

RESPONSE RULES:
- Set isComplete=true if a valid full name exists, regardless of optional fields
- If name is missing/incomplete: Set isComplete=false and prompt for full name
- If optional fields are missing: Include hint about what additional information would be helpful
- Never ask about information that was just provided or already exists in profile

RESPONSE FORMAT (STRICT JSON, NO ADDITIONAL TEXT):
{
  "answer": string,  // Main response message
  "basic": {
    "name": string | null,
    "gender": string | null,
    "age": number | null,
    "grade": number | null
  },
  "hint": string | null,  // "Additional information about [name]'s grade would help with carpool matching" etc.
  "isComplete": boolean  // true if valid full name exists
}

EXAMPLE:
For input "I'd like to add my son, John Silver. He is 8."
The response should be exactly:
{
  "answer": "Thank you for providing John Silver's information!",
  "basic": {
    "name": "John Silver",
    "gender": "Male",
    "age": 8,
    "grade": null
  },
  "hint": "Knowing John Silver's grade would help with carpool matching",
  "isComplete": true
}`
  }
};

module.exports = prompts;
