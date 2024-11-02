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
    cleanup
};