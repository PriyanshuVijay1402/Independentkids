const express = require('express');
const path = require('path');
const { engineerPrompt } = require('./promptEngineering');
const { generateResponse, resetProfile, getFirstQuestion } = require('./modelInteraction');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

app.getMaxListeners('/status', (req, res) => {
  res.json({ status: 'Server is running', model: 'llama3.2:3b'});
})

app.get('/first-question', (req, res) => {
    try {
        const response = getFirstQuestion();
        res.json({ response });
    } catch (error) {
        console.error('Error in /first-question route:', error);
        res.status(500).json({ error: 'Failed to get first question' });
    }
});

app.post('/generate', async (req, res) => {
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

app.post('/reset-profile', (req, res) => {
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
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
