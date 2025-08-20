const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const resetButton = document.createElement('button');
const findCarpoolButton = document.createElement('button');

// following id changes when rerun "npm run seed"
// need to find out new id in MongoDB
// let TEST_USER = "674de5ac85a6306d9791bb79"
let TEST_USER = "6881eadec944d64906df81e8"

// Add reset button
resetButton.id = 'reset-button';
resetButton.textContent = 'Reset';
resetButton.style.display = 'none';
document.querySelector('.chat-controls').appendChild(resetButton);

// Add find carpool button
findCarpoolButton.id = 'find-carpool-button';
findCarpoolButton.textContent = 'Find Carpool';
findCarpoolButton.style.display = 'none';
document.querySelector('.chat-controls').appendChild(findCarpoolButton);

function addMessage(message, isUser = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isUser ? 'user-message' : 'assistant-message');

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.textContent = message;

  messageElement.appendChild(messageContent);
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addInfo(info) {
  const infoElement = document.createElement('div');
  infoElement.classList.add('message');
  infoElement.classList.add('assistant-info');

  const infoContent = document.createElement('div');
  infoContent.classList.add('message-content');

  // Create a pre element to display the data
  const jsonElement = document.createElement('pre');
  jsonElement.classList.add('json-content');

  // Handle both string and object types
  if (typeof info === 'string') {
    try {
      // Try to parse if it's a JSON string
      const jsonData = JSON.parse(info);
      jsonElement.textContent = JSON.stringify(jsonData, null, 2);
    } catch (error) {
      // If parsing fails, display as plain text
      jsonElement.textContent = info;
    }
  } else {
    // If it's already an object, stringify it
    jsonElement.textContent = JSON.stringify(info, null, 2);
  }

  infoContent.appendChild(jsonElement);
  infoElement.appendChild(infoContent);
  chatContainer.appendChild(infoElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addHints(hintText, hintsList) {
  const hintsContainer = document.createElement('div');
  hintsContainer.classList.add('hints-container');

  // Create and append the hint text
  const hintTextElement = document.createElement('span');
  hintTextElement.classList.add('hint-text');
  hintTextElement.textContent = !hintsList || hintsList.length === 0 ? `Hint: ${hintText}` : `Hint: ${hintText}`;
  hintsContainer.appendChild(hintTextElement);

  // Create and append each hint as an unclickable button
  if (hintsList) {
    hintsList.forEach((hint, index) => {
      const hintButton = document.createElement('button');
      hintButton.classList.add('hint-button');
      hintButton.textContent = `${hint}`;
      hintButton.disabled = true;
      hintsContainer.appendChild(hintButton);
    });
  }

  // Append the hints container to the chat container
  chatContainer.appendChild(hintsContainer);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addSuggestions(suggestions) {
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.classList.add('suggestions-container');

  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement('button');
    suggestionElement.classList.add('suggestion');
    suggestionElement.textContent = suggestion;
    suggestionElement.addEventListener('click', () => {
      userInput.value = suggestion;
      sendMessage();
    });
    suggestionsContainer.appendChild(suggestionElement);
  });

  chatContainer.appendChild(suggestionsContainer);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Disable input and button while processing
  userInput.disabled = true;
  sendButton.disabled = true;

  try {
    addMessage(message, true);
    userInput.value = '';

    console.log('Sending message:', message);
    const response = await fetch(`http://localhost:3000/api/ai/generate?userId=${TEST_USER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        isNewSession: false // Regular messages are not new sessions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response data:', data);

    if (data.response) {
      console.log('Processing response:', data.response);

      // Always display the answer if it exists
      if (data.response.answer) {
        console.log('Adding message:', data.response.answer);
        addMessage(data.response.answer);
      }

      // Always display the info if it exists
      if (data.response.info) {
        console.log('Adding info:', data.response.info);
        addInfo(data.response.info);
      }

      // Always display hintMsg and hints if it exists
      if (data.response.hintMsg) {
        console.log('Adding hint message:', data.response.message);
        if (data.response.hints && data.response.hints.length > 0) {
          console.log('Adding hints:', data.response.hints);
        }
        addHints(data.response.hintMsg, data.response.hints);
      }

      // Add suggestions if they exist
      if (data.response.suggestions && data.response.suggestions.length > 0) {
        console.log('Adding suggestions:', data.response.suggestions);
        addSuggestions(data.response.suggestions);
      }

      // Show reset and find carpool buttons when profile is complete
      if (data.response.isProfileComplete) {
        console.log('Profile complete, showing reset and find carpool buttons');
        // resetButton.style.display = 'block';
        findCarpoolButton.style.display = 'block';
      }
    } else if (data.error) {
      console.error('Error in response:', data.error);
      addMessage(`Error: ${data.error}`);
    } else {
      console.error('Unexpected response format:', data);
      addMessage("I'm sorry, I couldn't generate a response. Please try again.");
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
    addMessage(`Error: ${error.message}. Please check the console for more details.`);
  } finally {
    // Re-enable input and button
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

async function resetProfile() {
  try {
    const response = await fetch('http://localhost:3000/api/ai/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: TEST_USER })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    chatContainer.innerHTML = '';
    resetButton.style.display = 'none';
    findCarpoolButton.style.display = 'none';

    // Show initial greeting with username
    await showInitialGreeting();

    if (data.response) {
      addMessage(data.response.answer);
      if (data.response.suggestions) {
        addSuggestions(data.response.suggestions);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    addMessage(`Error resetting profile: ${error.message}`);
  }
}

async function findCarpool() {
  try {
    // First sync cached user data back into DB
    const syncResponse = await fetch(`http://localhost:3000/api/users/${TEST_USER}/sync-cache`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!syncResponse.ok) {
      throw new Error(`HTTP error during sync! status: ${syncResponse.status}`);
    }

    const syncedUser = await syncResponse.json();
    console.log('Successfully synced user data:', syncedUser);

    // Get the current dependent and activity from cache
    const currentMatchResponse = await fetch(`http://localhost:3000/api/users/${TEST_USER}/current-match`);
    if (!currentMatchResponse.ok) {
      throw new Error(`HTTP error getting current match info! status: ${currentMatchResponse.status}`);
    }
    const currentMatch = await currentMatchResponse.json();

    if (!currentMatch || !currentMatch.dependent_name || !currentMatch.activity_name) {
      throw new Error('No current dependent/activity information found');
    }

    // Use the cached dependent and activity data for matching
    const matchData = {
      dependent_name: currentMatch.dependent_name,
      activity_name: currentMatch.activity_name,
      radius: 2 // hard code to 2 miles for now, will need to be fetched from user's profile/preference later on.
    };

    // Now perform the carpool matching
    const matchResponse = await fetch(`http://localhost:3000/api/users/${TEST_USER}/match-carpool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(matchData)
    });

    if (!matchResponse.ok) {
      throw new Error(`HTTP error during matching! status: ${matchResponse.status}`);
    }

    const matches = await matchResponse.json();
    addMessage(`Finding carpool matches for ${currentMatch.dependent_name}'s ${currentMatch.activity_name} activity:`);
    addInfo(matches);

  } catch (error) {
    console.error('Error in findCarpool:', error);
    addMessage(`Error finding carpool matches: ${error.message}`);
  }
}

async function getFirstQuestion() {
  try {
    const response = await fetch(`http://localhost:3000/api/ai/generate?userId=${TEST_USER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isNewSession: true // Indicate this is a new session
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.response) {
      addMessage(data.response.answer);
      if (data.response.suggestions) {
        addSuggestions(data.response.suggestions);
      }
    }
  } catch (error) {
    console.error('Error getting first question:', error);
    addMessage(`Error: ${error.message}. Please check the console for more details.`);
  }
}

async function getUserById(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

async function showInitialGreeting() {
  try {
    console.log('Starting initial greeting...');
    const user = await getUserById(TEST_USER);
    console.log('User data received:', user);

    const username = user?.name || "there";
    addMessage(`Hello, ${username}! I'm your Carpool Assistant. Let me check your profile, and I'll guide you through some questions to understand your carpooling needs.`);
  } catch (error) {
    console.error('Error fetching user:', error);
    addMessage("Hello! I'm your Carpool Assistant. Let's create your carpool profile. I'll guide you through some questions to understand your carpooling needs.");
  }
}

// Add event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
// resetButton.addEventListener('click', resetProfile);
findCarpoolButton.addEventListener('click', findCarpool);

// Initial greeting and first question
showInitialGreeting().then(() => {
  getFirstQuestion();
});
