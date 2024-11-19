const express = require('express');
const User = require('../db/models/user');
const { cacheUserProfile, getCachedUserProfile, deleteCachedUserProfile } = require('../config/redis');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    // First try to get from cache
    const cachedUser = await getCachedUserProfile(req.params.id);
    if (cachedUser) {
      return res.json(cachedUser);
    }

    // If not in cache, get from database
    const user = await User.findById(req.params.id);
    if (user) {
      // Cache the user profile
      await cacheUserProfile(req.params.id, user);
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    // Cache the new user profile
    await cacheUserProfile(newUser._id, newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      Object.assign(user, req.body);
      const updatedUser = await user.save();
      // Update the cache with new user data
      await cacheUserProfile(req.params.id, updatedUser);
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update database from cache
router.patch('/:id/sync-cache', async (req, res) => {
  try {
    // Get cached user data
    const cachedUser = await getCachedUserProfile(req.params.id);
    console.log('Cached user data:', JSON.stringify(cachedUser, null, 2));
    if (!cachedUser) {
      console.log('No cached data found');
      return res.status(404).json({ message: 'No cached data found for this user' });
    }

    // Find and update user directly using findOneAndUpdate
    const updateData = {};

    // Only include fields that exist in the cached data
    if (cachedUser.dependent_information) {
      // Ensure dependent_information is an array
      const dependentInfo = Array.isArray(cachedUser.dependent_information)
        ? cachedUser.dependent_information
        : [cachedUser.dependent_information];

      // Validate and normalize dependent information
      updateData.dependent_information = dependentInfo.map(dep => ({
        name: dep.name || '',
        gender: dep.gender || '',
        age: dep.age || 0,
        grade: dep.grade || 0,
        school_info: {
          name: dep.school_info?.name || '',
          address: dep.school_info?.address || {},
          time_window: dep.school_info?.time_window || {}
        },
        activities: Array.isArray(dep.activities) ? dep.activities.map(act => ({
          name: act.name || '',
          address: act.address || {},
          time_window: act.time_window || {},
          sharing_preferences: act.sharing_preferences || { willing_to_share_rides: false },
          schedule: Array.isArray(act.schedule) ? act.schedule : []
        })) : [],
        additional_info: dep.additional_info || {}
      }));
    }

    // Add other fields if they exist in cached data
    if (cachedUser.safety_info) updateData.safety_info = cachedUser.safety_info;
    if (cachedUser.vehicles) updateData.vehicles = cachedUser.vehicles;
    if (cachedUser.isRider !== undefined) updateData.isRider = cachedUser.isRider;
    if (cachedUser.isDriver !== undefined) updateData.isDriver = cachedUser.isDriver;
    if (cachedUser.friend_list) updateData.friend_list = cachedUser.friend_list;
    if (cachedUser.carpool_preference) updateData.carpool_preference = cachedUser.carpool_preference;

    console.log('Update data:', updateData);

    // Use findOneAndUpdate to avoid version conflicts
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validators
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    console.log('Verification of updated user:', JSON.stringify(updatedUser, null, 2));
    res.json(updatedUser);

  } catch (error) {
    console.error('Error in sync-cache:', error);
    res.status(500).json({
      message: error.message,
      stack: error.stack,
      details: 'Error occurred while syncing cache to database'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      // Delete the user from cache
      await deleteCachedUserProfile(req.params.id);
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
