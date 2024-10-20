const { Ollama } = require('ollama');

const ollama = new Ollama();

async function generateResponse(prompt, model) {
  try {
    const response = await ollama.generate({
      model: model,
      prompt: prompt,
    });

    console.log('Raw response:', response.response); // Log raw response for debugging

    // New regex to match multiple JSON objects
    const jsonPattern = /(\{[\s\S]*?\})/g;
    const jsonMatches = response.response.match(jsonPattern);

    if (jsonMatches) {
      const parsedResponses = jsonMatches.map(jsonString => {
        try {
          return JSON.parse(jsonString.replace(/`/g, ''));
        } catch (error) {
          console.error('Error parsing JSON object:', error);
          return null;
        }
      }).filter(obj => obj !== null);

      if (parsedResponses.length > 0) {
        // Combine all parsed responses
        const combinedResponse = {
          answer: parsedResponses.map(r => r.answer).join(' '),
          suggestions: parsedResponses.flatMap(r => r.suggestions || []),
          isProfileComplete: parsedResponses.some(r => r.isProfileComplete === true)
        };
        return combinedResponse;
      }
    }

    // If parsing fails, use the entire response as the answer with default suggestions
    return {
      answer: response.response,
      suggestions: [
        "What are your children's school and activity schedules?",
        "How would you describe your comfort level with different carpool arrangements (e.g., close friends, neighbors)?",
        "Are there any specific safety measures or requirements you have for your children's carpools?"
      ],
      isProfileComplete: false
    };
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = { generateResponse };
