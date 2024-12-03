const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect(); // Changed from client.connect() to redisClient.connect()
    return true;
  } catch (err) {
    console.error('Failed to connect:', err);
    return false;
  }
}

// Cache user profile for 1 hour
async function cacheUserProfile(userId, profile) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    await redisClient.set(`user:${userId}:profile`, JSON.stringify(profile), {
      EX: 3600 // 1 hour expiration
    });
  } catch (error) {
    console.error('Error caching user profile:', error);
  }
}

// Get cached user profile
async function getCachedUserProfile(userId) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    const cachedProfile = await redisClient.get(`user:${userId}:profile`);
    return cachedProfile ? JSON.parse(cachedProfile) : null;
  } catch (error) {
    console.error('Error getting cached user profile:', error);
    return null;
  }
}

// Delete cached user profile
async function deleteCachedUserProfile(userId) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    await redisClient.del(`user:${userId}:profile`);
  } catch (error) {
    console.error('Error deleting cached user profile:', error);
  }
}

// Update or add dependent in cached user profile
async function updateCachedDependent(userId, dependent) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }

    const currentProfile = await getCachedUserProfile(userId);
    if (!currentProfile) {
      // If no profile exists, create new one with dependent
      const newProfile = {
        dependent_information: [dependent]
      };
      await cacheUserProfile(userId, newProfile);
      return;
    }

    // Ensure dependent_information exists
    if (!currentProfile.dependent_information) {
      currentProfile.dependent_information = [];
    }

    // Find index of dependent with matching name
    const dependentIndex = currentProfile.dependent_information.findIndex(
      dep => dep.name === dependent.name
    );

    if (dependentIndex !== -1) {
      // Update existing dependent
      currentProfile.dependent_information[dependentIndex] = dependent;
    } else {
      // Add new dependent
      currentProfile.dependent_information.push(dependent);
    }

    await cacheUserProfile(userId, currentProfile);
  } catch (error) {
    console.error('Error updating cached dependent:', error);
  }
}

// Cache current dependent and activity for matching
async function cacheCurrentDependentActivity(userId, dependentName, activityName) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    await redisClient.set(`user:${userId}:current_match`, JSON.stringify({
      dependent_name: dependentName,
      activity_name: activityName
    }), {
      EX: 3600 // 1 hour expiration
    });
  } catch (error) {
    console.error('Error caching current dependent/activity:', error);
  }
}

// Get cached current dependent and activity for matching
async function getCurrentDependentActivity(userId) {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    const cached = await redisClient.get(`user:${userId}:current_match`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting current dependent/activity:', error);
    return null;
  }
}

// Cleanup function for graceful shutdown
async function cleanup() {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error('Error during Redis cleanup:', error);
  }
}

module.exports = {
  redisClient,
  connectRedis,
  cacheUserProfile,
  getCachedUserProfile,
  deleteCachedUserProfile,
  updateCachedDependent,
  cacheCurrentDependentActivity,
  getCurrentDependentActivity,
  cleanup
};
