const initialQuestion = {
  id: 'kidSelection',
  question: "Would you like to find a carpool for one of your existing children or add a new child? Please select from your existing children or type 'new' for a new child:",
  validationPrompt: `Analyze if the user's answer either:
1. Matches one of the existing children's names
2. Indicates they want to add a new child (keyword: 'new')
Response format: { "isValid": boolean, "reason": "explanation", "isNewKid": boolean, "selectedKid": string }
User answer: `,
  followUp: ["For example: 'John' to select existing child John, or 'new' to add a new child"],
  importance: "This helps us determine whether to use existing information or collect new information"
};

const newKidQuestions = [
  {
    id: 'personalInfo',
    question: "Please provide your child's name, gender, and age.",
    validationPrompt: `Analyze if the user's answer contains all:
1. Name of child
2. Gender
3. Age
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
    followUp: ["For example: 'John is a boy, 8 years old'"],
    importance: "This helps us understand your child's basic information for proper matching"
  },
  {
    id: 'educationInfo',
    question: "Please provide your child's grade level and school name, including the school's address if known.",
    validationPrompt: `Analyze if the user's answer contains:
1. Grade level
2. School name
3. School address (if provided)
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
    followUp: ["For example: 'John is in 3rd grade at Lincoln Elementary (123 School St)'"],
    importance: "This helps match you with families from the same school or area"
  },
  {
    id: 'schedule',
    question: "What are the school hours? Please specify start and end times.",
    validationPrompt: `Analyze if the user's answer contains specific time information:
1. School start time
2. School end time
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
    followUp: ["For example: 'School starts at 8:30 AM and ends at 3:15 PM'"],
    importance: "This ensures compatible pickup and drop-off times"
  }
];

const activityQuestions = [
  {
    id: 'hasActivities',
    question: "Does your child have any after-school activities that need transportation?",
    validationPrompt: `Analyze if the user's answer clearly indicates:
1. Yes/No response about having activities
Response format: { "isValid": boolean, "reason": "explanation", "hasActivities": boolean }
User answer: `,
    followUp: ["Please answer 'yes' or 'no'"],
    importance: "This helps us understand if additional transportation arrangements are needed"
  },
  {
    id: 'activityDetails',
    question: "Please provide details about the activity: name, location (address), and schedule (start and end times).",
    validationPrompt: `Analyze if the user's answer contains:
1. Activity name
2. Location/address
3. Schedule (start and end times)
Response format: { "isValid": boolean, "reason": "explanation" }
User answer: `,
    followUp: ["For example: 'Soccer practice at City Park (456 Park Ave), Tuesday and Thursday 4:00 PM to 5:30 PM'"],
    importance: "This helps coordinate transportation for after-school activities",
    conditional: "only if hasActivities is true"
  }
];

function getMandatoryQuestions(userState) {
  const { hasExistingChildren, selectedChild } = userState;
  
  if (!hasExistingChildren) {
    return newKidQuestions.concat(activityQuestions);
  }
  
  if (!selectedChild) {
    return [initialQuestion];
  }
  
  // If user selected an existing child, skip basic info and go straight to activities
  return activityQuestions;
}

module.exports = { 
  getMandatoryQuestions,
  initialQuestion,
  newKidQuestions,
  activityQuestions
};
