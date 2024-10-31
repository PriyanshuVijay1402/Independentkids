const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const resetButton = document.createElement('button');

// Add reset button
resetButton.id = 'reset-button';
resetButton.textContent = 'Start New Profile';
resetButton.style.display = 'none';
document.querySelector('.chat-controls').appendChild(resetButton);

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
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message })
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

            // Add suggestions if they exist
            if (data.response.suggestions && data.response.suggestions.length > 0) {
                console.log('Adding suggestions:', data.response.suggestions);
                addSuggestions(data.response.suggestions);
            }

            // Show reset button when profile is complete
            if (data.response.isProfileComplete) {
                console.log('Profile complete, showing reset button');
                resetButton.style.display = 'block';
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
        const response = await fetch('http://localhost:3000/reset-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        chatContainer.innerHTML = '';
        resetButton.style.display = 'none';
        
        // Show initial greeting with username
        await showInitialGreeting();
        
        if (data.firstQuestion) {
            addMessage(data.firstQuestion.answer);
            if (data.firstQuestion.suggestions) {
                addSuggestions(data.firstQuestion.suggestions);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage(`Error resetting profile: ${error.message}`);
    }
}

async function getFirstQuestion() {
    try {
        const response = await fetch('http://localhost:3000/first-question');
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

async function showInitialGreeting() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        const username = users[0]?.name || "there";
        addMessage(`Hello, ${username}! I'm your Carpool Assistant. Let's create your carpool profile. I'll guide you through some questions to understand your carpooling needs.`);
    } catch (error) {
        console.error('Error fetching user:', error);
        addMessage("Hello! I'm your Carpool Assistant. Let's create your carpool profile. I'll guide you through some questions to understand your carpooling needs.");
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
resetButton.addEventListener('click', resetProfile);

// Initial greeting and first question
showInitialGreeting().then(() => {
    getFirstQuestion();
});
