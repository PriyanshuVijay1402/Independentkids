const express = require('express');
const { engineerPrompt } = require('./promptEngineering');
const { generateResponse } = require('./modelInteraction');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/status', (req, res) => {
  res.json({ status: 'Server is running', model: 'llama3.2:1b' });
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'llama3.2:1b', context = {} } = req.body;
    const engineeredPrompt = engineerPrompt(prompt, context);
    const response = await generateResponse(engineeredPrompt, model);
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

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} with model llama3.2:1b`);
});
