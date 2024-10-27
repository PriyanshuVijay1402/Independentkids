const mandatoryQuestions = [
  {
    id: 'childrenInfo',
    question: "How many children do you need transportation for, and what are their ages?",
    validationPrompt: `Analyze if the user's answer contains both:
1. Number of children
2. Ages of children
3. user may only have 1 child, put that into consideration
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
  }
];

module.exports = { mandatoryQuestions };
