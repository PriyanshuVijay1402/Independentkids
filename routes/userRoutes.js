const express = require('express');
const User = require('../db/models/user');
const { cacheUserProfile, getCachedUserProfile, deleteCachedUserProfile } = require('../config/redis');
const { findCarpoolMatches } = require('../util/data_utils');
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

// Match carpool for a specific dependent and activity
router.post('/:id/match-carpool', async (req, res) => {
  try {
    const { dependent_name, activity_name, radius } = req.body;

    // Validate request body
    if (!dependent_name || !activity_name) {
      return res.status(400).json({ 
        message: 'Both dependent_name and activity_name are required' 
      });
    }

    // Find the requesting user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the findCarpoolMatches utility function with optional radius
    const matches = await findCarpoolMatches(user, dependent_name, activity_name, radius);
    res.json(matches);

  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const cachedUser = await getCachedUserProfile(req.params.id);
    console.log('Cached user data:', JSON.stringify(cachedUser, null, 2));

    if (!cachedUser) {
      return res.status(404).json({ message: 'No cached data found for this user' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: cachedUser },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    console.log('Verification of updated user:', JSON.stringify(updatedUser, null, 2));
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in sync-cache:', error);
    res.status(500).json({ message: error.message });
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
