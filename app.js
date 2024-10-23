const express = require('express');
const { engineerPrompt } = require('./promptEngineering');
const { generateResponse, resetProfile } = require('./modelInteraction');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/status', (req, res) => {
  res.json({ status: 'Server is running', model: 'llama3.2:3b' });
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await generateResponse(prompt);
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
    res.json({ status: 'Profile reset successful' });
  } catch (error) {
    console.error('Error in /reset-profile route:', error);
    res.status(500).json({ error: 'Failed to reset profile' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
