// Prompts for AI interactions in the carpool system

const prompts = {
  prefQuestion: (profileContext, question, input) => {
    return `You are a carpool assistant collecting user's sharing preference. Based on the question, input, and profile context:

Question: ${question}
Input: ${input}
Profile Context: ${JSON.stringify(profileContext, null, 2)}

TASK:
Generate a response that captures the user's ride-sharing preferences:
- For update scenarios (when question contains "ready for next step" or "update your sharing preference"):
  * Allow updates to both willing_to_share_rides and sharing_type based on input
  * If input indicates a change in preference, update accordingly
  * If input doesn't indicate any changes, maintain existing preferences from profileContext
  * Respond with confirmation of any changes made
- For initial collection:
  * Check willing_to_share_rides from profileContext first
  * If already true in profileContext, focus only on collecting sharing_type
  * Set willing_to_share_rides to true for explicit positive responses
- Set sharing_type based on:
  * "split" = users managing both drop-off and pick-up duties for an activity within the same day
  * "rotation" = users alternating driving responsibilities over a longer period
  * null = when user is flexible and okay with either type of sharing arrangement

Return ONLY a JSON response with no additional text, following this format:
{
  "answer": string,  // Main response message explaining the understood preferences
  "sharing_preferences": {
    "willing_to_share_rides": boolean,  // true for any positive response or if true in profileContext
    "sharing_type": string | null  // "split", "rotation", or null (flexible with either)
  },
  "hint": string | null,  // Hint about missing or unclear information
  "isComplete": boolean  // true if sharing type is specified or explicitly flexible
}

EXAMPLES:

For question: "We are ready for next step, or feel free update your sharing preference if you changed your mind"
Input: "Actually, I prefer rotation instead of split"
Profile with existing split preference:
{
  "answer": "I've updated your preference to rotation sharing, where users alternate driving responsibilities over time.",
  "sharing_preferences": {
    "willing_to_share_rides": true,
    "sharing_type": "rotation"
  },
  "hint": null,
  "isComplete": true
}

For question: "We are ready for next step, or feel free update your sharing preference if you changed your mind"
Input: "I changed my mind, I don't want to share rides anymore"
Profile with existing preferences:
{
  "answer": "I've updated your preference. You're no longer interested in sharing rides.",
  "sharing_preferences": {
    "willing_to_share_rides": false,
    "sharing_type": null
  },
  "hint": null,
  "isComplete": true
}

For question: "We are ready for next step, or feel free update your sharing preference if you changed your mind"
Input: "I'm now flexible with either arrangement"
Profile with existing rotation preference:
{
  "answer": "I've updated your preference to be flexible with either sharing arrangement.",
  "sharing_preferences": {
    "willing_to_share_rides": true,
    "sharing_type": null
  },
  "hint": null,
  "isComplete": true
}

For question: "What's your preferred sharing arrangement for soccer practice?"
Input: "Split"
Profile with willing_to_share_rides true:
{
  "answer": "You've indicated a split arrangement for soccer practice, managing both drop-off and pick-up duties within the same day.",
  "sharing_preferences": {
    "willing_to_share_rides": true,
    "sharing_type": "split"
  },
  "hint": null,
  "isComplete": true
}

For question: "Would you like to share rides for swimming class?"
Input: "yes"
Profile with no previous preferences:
{
  "answer": "Great that you're interested in sharing rides for swimming class! Let me ask about your preferred sharing arrangement.",
  "sharing_preferences": {
    "willing_to_share_rides": true,
    "sharing_type": null
  },
  "hint": "Would you prefer to: 1) Split - involves users managing both drop-off and pick-up duties for an activity within the same day, or 2) Rotation - users alternating driving responsibilities over a longer period? You can also indicate if you're flexible with either arrangement.",
  "isComplete": false
}`
  }
};

module.exports = prompts;
