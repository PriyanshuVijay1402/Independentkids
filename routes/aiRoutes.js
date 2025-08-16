const express = require('express');
const { generateResponse, resetProfile } = require('../modelInteraction');

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.query;
        const { prompt = null, isNewSession = false } = req.body;
        console.log('Received prompt:', prompt);
        console.log('Received user:', userId);
        console.log('Is new session:', isNewSession);

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const response = await generateResponse(userId, prompt, isNewSession);
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

router.post('/reset', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await resetProfile(userId);
        // After reset, treat it as a new session
        const response = await generateResponse(userId, null, true);
        res.json({ status: 'Profile reset successful', response });
    } catch (error) {
        console.error('Error in /reset route:', error);
        res.status(500).json({ error: 'Failed to reset profile' });
    }
});

module.exports = router;
