const express = require('express');
const { generateResponse, resetProfile, getFirstQuestion } = require('../modelInteraction');

const router = express.Router();

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

router.get('/first-question', (req, res) => {
    try {
        const response = getFirstQuestion();
        res.json({ response });
    } catch (error) {
        console.error('Error in /first-question route:', error);
        res.status(500).json({ error: 'Failed to get first question' });
    }
});

router.post('/reset', (req, res) => {
    try {
        resetProfile();
        const firstQuestion = getFirstQuestion();
        res.json({ status: 'Profile reset successful', firstQuestion });
    } catch (error) {
        console.error('Error in /reset route:', error);
        res.status(500).json({ error: 'Failed to reset profile' });
    }
});

module.exports = router;
