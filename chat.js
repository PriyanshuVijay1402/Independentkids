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
    if (message) {
        addMessage(message, true);
        userInput.value = '';

        try {
            const response = await fetch('http://localhost:3000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.response && data.response.answer) {
                addMessage(data.response.answer);

                if (data.response.suggestions && data.response.suggestions.length > 0) {
                    addSuggestions(data.response.suggestions);
                }

                // Show reset button when profile is complete
                if (data.response.isProfileComplete) {
                    resetButton.style.display = 'block';
                }
            } else if (data.error) {
                addMessage(`Error: ${data.error}`);
            } else {
                addMessage("I'm sorry, I couldn't generate a response. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage(`Error: ${error.message}. Please check the console for more details.`);
        }
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

        // Clear chat
        chatContainer.innerHTML = '';
        resetButton.style.display = 'none';

        // Add initial greeting
        addMessage("Hello! I'm your Carpool Assistant. Let's create your carpool profile. I'll guide you through some questions to understand your carpooling needs.");
    } catch (error) {
        console.error('Error:', error);
        addMessage(`Error resetting profile: ${error.message}`);
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
resetButton.addEventListener('click', resetProfile);

// Initial greeting
addMessage("Hello! I'm your Carpool Assistant. Let's create your carpool profile. I'll guide you through some questions to understand your carpooling needs.");
