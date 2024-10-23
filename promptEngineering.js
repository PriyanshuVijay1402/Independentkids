function engineerPrompt(userPrompt, context) {
  // With CarpoolProfileAgent handling the core logic, 
  // promptEngineering now just passes through the user input
  return userPrompt;
}

module.exports = { engineerPrompt };
