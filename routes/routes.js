const express = require('express');
const path = require('path');
const userRoutes = require('./userRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

// Mount User API routes
router.use('/api/users', userRoutes);

// Mount AI API routes
router.use('/api/ai', aiRoutes);

// Status endpoint
router.get('/status', (req, res) => {
  res.json({ status: 'Server is running', model: 'llama3.2:3b'});
});

// Serve index.html for the root route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = router;
