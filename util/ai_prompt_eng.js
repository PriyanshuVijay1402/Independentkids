// Prompts for AI interactions in the carpool system
const prompts = {
    optionalQuestion: (profileContext) => `As a carpool matching assistant, generate a relevant follow-up question based on this profile:
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
}`
};

module.exports = prompts;
