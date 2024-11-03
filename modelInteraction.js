const CarpoolProfileAgent = require('./util/carpoolAgent/CarpoolAgent');
const { deleteCachedUserProfile } = require('./config/redis');

// Map to store agent instances by userId
const agentInstances = new Map();

// Get or create agent instance for a userId
function getAgentInstance(userId) {
  if (!agentInstances.has(userId)) {
    agentInstances.set(userId, new CarpoolProfileAgent(userId));
  }
  return agentInstances.get(userId);
}

async function getFirstQuestion(userId) {
  try {
    const agent = getAgentInstance(userId);
    const response = await agent.getFirstQuestion();
    return response;
  } catch (error) {
    console.error('Error in getFirstQuestion:', error);
    throw error;
  }
}

async function generateResponse(userId, input = null) {
  try {
    const agent = getAgentInstance(userId);
    const response = await agent.generateResponse(input);
    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
}


async function resetProfile(userId) {
  try {
    await deleteCachedUserProfile(userId);
    if (agentInstances.has(userId)) {
      agentInstances.get(userId).reset();
      agentInstances.delete(userId);
    }
  } catch (error) {
    console.error('Error in resetProfile:', error);
    throw error;
  }
}

module.exports = {
  getFirstQuestion,
  generateResponse,
  resetProfile
};
