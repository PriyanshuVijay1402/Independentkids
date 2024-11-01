const CarpoolProfileAgent = require('./util/carpoolAgent/CarpoolAgent');

// Create agent instance
const carpoolAgent = new CarpoolProfileAgent();

// Export interface functions
async function generateResponse(prompt) {
  return carpoolAgent.generateResponse(prompt);
}

function resetProfile() {
  carpoolAgent.reset();
}

function getFirstQuestion() {
  return carpoolAgent.getFirstQuestion();
}

module.exports = { generateResponse, resetProfile, getFirstQuestion };
