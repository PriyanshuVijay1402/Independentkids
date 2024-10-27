const express = require('express');
const path = require('path');
const { generateResponse, resetProfile, getFirstQuestion } = require('./modelInteraction');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'Server is running', model: 'llama3.2:3b'});
});

router.get('/first-question', (req, res) => {
    try {
        const response = getFirstQuestion();
        res.json({ response });
    } catch (error) {
        console.error('Error in /first-question route:', error);
        res.status(500).json({ error: 'Failed to get first question' });
    }
});

router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Received prompt:', prompt);

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await generateResponse(prompt);
        console.log('Generated response:', response);
        res.json({ response });
    } catch (error) {
        console.error('Error in /generate route:', error);
        let errorMessage = 'An error occurred while generating the response.';
        if (error.message) {
            errorMessage += ` Details: ${error.message}`;
        }
        res.status(500).json({ error: errorMessage });
    }
});

router.post('/reset-profile', (req, res) => {
    try {
        resetProfile();
        const firstQuestion = getFirstQuestion();
        res.json({ status: 'Profile reset successful', firstQuestion });
    } catch (error) {
        console.error('Error in /reset-profile route:', error);
        res.status(500).json({ error: 'Failed to reset profile' });
    }
});

// Serve index.html for the root route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = router;
