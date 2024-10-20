const { Ollama } = require('ollama');

const ollama = new Ollama();

async function generateResponse(prompt, model) {
  try {
    const response = await ollama.generate({
      model: model,
      prompt: prompt,
    });

    console.log('Raw response:', response.response); // Log raw response for debugging

    let parsedResponse;
    try {
      // First, try to parse the entire response as JSON
      parsedResponse = JSON.parse(response.response);
      
      // Check if the parsed response has the expected structure
      if (parsedResponse.answer && Array.isArray(parsedResponse.suggestions)) {
        return parsedResponse; // Return the parsed response directly if it has the correct structure
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);

      // If parsing fails, attempt to extract answer and suggestions using a more flexible regex
      const jsonPattern = /\{[\s\S]*\}/; // Match any JSON-like structure
      const jsonMatch = response.response.match(jsonPattern);

      if (jsonMatch) {
        const jsonString = jsonMatch[0].replace(/`/g, ''); // Remove backticks if present
        try {
          parsedResponse = JSON.parse(jsonString);
          if (parsedResponse.answer && Array.isArray(parsedResponse.suggestions)) {
            return parsedResponse; // Return the parsed response if it has the correct structure
          }
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
        }
      }
    }

    // If we reach here, either parsing failed or the response didn't have the expected structure
    // Use the entire response as the answer with default suggestions
    return {
      answer: response.response,
      suggestions: [
        "What are your children's school and activity schedules?",
        "How would you describe your comfort level with different carpool arrangements (e.g., close friends, neighbors)?",
        "Are there any specific safety measures or requirements you have for your children's carpools?"
      ]
    };
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = { generateResponse };
