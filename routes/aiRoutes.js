const express = require('express');
const { generateResponse, resetProfile, getFirstQuestion } = require('../modelInteraction');

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { prompt, userId } = req.body;
        console.log('Received prompt:', prompt);

        if (!prompt || !userId) {
            return res.status(400).json({ error: 'Prompt and userId are required' });
        }

        const response = await generateResponse(prompt, userId);
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

router.get('/first-question', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const response = await getFirstQuestion(userId);
        console.debug('First question response:', response);
        res.json({ response });
    } catch (error) {
        console.error('Error in /first-question route:', error);
        res.status(500).json({ error: 'Failed to get first question' });
    }
});

router.post('/reset', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await resetProfile(userId);
        const firstQuestion = await getFirstQuestion(userId);
        res.json({ status: 'Profile reset successful', firstQuestion });
    } catch (error) {
        console.error('Error in /reset route:', error);
        res.status(500).json({ error: 'Failed to reset profile' });
    }
});

module.exports = router;
