const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(message, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'assistant-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
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
                body: JSON.stringify({
                    prompt: message,
                    context: {
                        tone: 'friendly',
                        maxLength: 250
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.response && data.response.answer) {
                addMessage(data.response.answer);

                if (data.response.suggestions && data.response.suggestions.length > 0) {
                    addMessage("Suggestions:");
                    data.response.suggestions.forEach(suggestion => {
                        addMessage(`- ${suggestion}`);
                    });
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

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial greeting
addMessage("Hello! I'm your Carpool Profile Assistant. How can I help you improve your carpool profile today?");
