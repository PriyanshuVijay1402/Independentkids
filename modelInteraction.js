const CarpoolProfileAgent = require('./util/carpoolAgent/CarpoolAgent');
const { deleteCachedUserProfile } = require('./config/redis');

// Map to store agent instances by userId
const agentInstances = new Map();

// Get or create agent instance for a userId
function getAgentInstance(userId, forceNew = false) {
  // If forceNew is true or instance doesn't exist, create new instance
  if (forceNew || !agentInstances.has(userId)) {
    // If there's an existing instance, clean it up first
    if (agentInstances.has(userId)) {
      agentInstances.get(userId).reset();
      agentInstances.delete(userId);
    }
    agentInstances.set(userId, new CarpoolProfileAgent(userId));
  }
  return agentInstances.get(userId);
}

async function generateResponse(userId, input = null, isNewSession = true) {
  try {
    // Force new instance on new session (page refresh)
    const agent = getAgentInstance(userId, isNewSession);
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
  generateResponse,
  resetProfile
};
