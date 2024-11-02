const CarpoolProfileAgent = require('./util/carpoolAgent/CarpoolAgent');
const { getCachedUserProfile, cacheUserProfile, deleteCachedUserProfile } = require('./config/redis');

// Create agent instance
const carpoolAgent = new CarpoolProfileAgent();

// Export interface functions
async function generateResponse(prompt, userId) {
  try {
    // Try to get cached profile
    const cachedProfile = await getCachedUserProfile(userId);
    
    // Generate response with cached profile
    const response = await carpoolAgent.generateResponse(prompt, cachedProfile);
    
    // Cache the updated profile if response contains updates
    if (response.profile) {
      await cacheUserProfile(userId, response.profile);
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
}

async function resetProfile(userId) {
  try {
    // Clear cached profile
    await deleteCachedUserProfile(userId);
    carpoolAgent.reset();
  } catch (error) {
    console.error('Error in resetProfile:', error);
    throw error;
  }
}

async function getFirstQuestion(userId) {
  try {
    const response = await carpoolAgent.getFirstQuestion(userId);
    return response;
  } catch (error) {
    console.error('Error in getFirstQuestion:', error);
    throw error;
  }
}

module.exports = { generateResponse, resetProfile, getFirstQuestion };
