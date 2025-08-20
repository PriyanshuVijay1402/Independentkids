const express = require('express');
const User = require('../db/models/user');
const { cacheUserProfile, getCachedUserProfile, deleteCachedUserProfile, getCurrentDependentActivity } = require('../config/redis');
const { findCarpoolMatches } = require('../util/data_utils');

const upload = require('../middleware/upload');
const { uploadUserPhoto, uploadDependentPhoto } = require('../controllers/userController');

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

// Updated: Get user by ID with profile fallback logic
router.get('/:id', async (req, res) => {
  try {
    const cachedUser = await getCachedUserProfile(req.params.id);
    const user = cachedUser || await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const userWithProfileImage = {
      ...user.toObject(),
      profileImage: user.profileImage || process.env.DEFAULT_PROFILE_IMAGE
    };

    res.json(userWithProfileImage);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload user photo
router.post('/upload-photo/:id', upload.single('photo'), uploadUserPhoto);

// Upload dependent photo
router.post('/:id/dependents/:dependentName/photo', upload.single('photo'), uploadDependentPhoto);

// Get current dependent and activity for matching
router.get('/:id/current-match', async (req, res) => {
  try {
    const currentMatch = await getCurrentDependentActivity(req.params.id);
    if (!currentMatch) {
      return res.status(404).json({ message: 'No current match information found' });
    }
    res.json(currentMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    if (typeof newUser.generateProfileSummary === 'function') {
      await newUser.generateProfileSummary();
      await newUser.save();
    }
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

    if (!dependent_name || !activity_name) {
      return res.status(400).json({ 
        message: 'Both dependent_name and activity_name are required' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
      //  Add here (auto-regenerate summary on update)
      if (typeof updatedUser.generateProfileSummary === 'function') {
        await updatedUser.generateProfileSummary();
        await updatedUser.save();
      }
      await cacheUserProfile(req.params.id, updatedUser);
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sync cache with DB
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
