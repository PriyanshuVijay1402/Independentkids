# Product-18---Independent-Kids

## Carpool Profile Assistant
An AI-powered chat assistant that helps users create and manage their carpool profiles.
The assistant guides users through a series of questions to understand their carpooling needs and preferences.


https://github.com/user-attachments/assets/c145d2f8-95a1-4c1e-b8e5-a129f45bf698


## Features

- Interactive chat interface
- AI-powered conversation
- MongoDB database integration
- Redis state management
- User profile management
- Personalized greeting with user's name
- Suggestion buttons for quick responses
- Intelligent question handling and validation
- State-based conversation flow

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Cache: Redis
- AI: ~~llama3.2:3b model~~ Claude Haiku

## Project Structure

```
├── config/
│   ├── db.js           # MongoDB configuration
│   └── redis.js        # Redis configuration
├── db/
│   ├── models/         # Database models
│   └── seeders/        # Database seeders
├── routes/
│   ├── aiRoutes.js     # AI-related routes
│   ├── userRoutes.js   # User-related routes
│   └── routes.js       # Main route configuration
├── util/
│   ├── carpoolAgent/   # Carpool agent components
│   │   ├── CarpoolAgent.js
│   │   ├── InitialQuestionHandler.js
│   │   ├── MandatoryQuestionHandler.js
│   │   ├── StateManager.js
│   │   └── ValidationHandler.js
│   ├── prompts/        # AI prompt templates
│   ├── vars/           # Enums and templates
│   └── utils.js        # Utility functions
├── public/
│   └── images/         # Static images
├── app.js              # Express application setup
├── chat.js             # Chat interface logic
└── middleware.js       # Application middleware
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB and Redis Service:
```bash
sudo npm run db
```

3. Start Ollama service (optional, no longer required since we move onto Claude API):
```bash
ollama serve
```

4. Seed the database:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## API Endpoints

### AI Routes
- POST `/api/ai/generate` - Generate AI response
- POST `/api/ai/reset` - Reset user profile

### User Routes
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## Development
- `ollama serve` is no longer required since dev move onto Claude. If you'd like to use local LLM model, you can uncomment ollama related part to test.
- a `Claude` API Key is needed. Please provide a key in .env file at root level
- Use `sudo service mongodb start` to start MongoDB
- Use `sudo service redis-server start` to start Redis
- Use `npm run db` will do above two command all at once :)
- Use `npm run dev` to start the application server👍
