# Product-18---Independent-Kids

## Carpool Profile Assistant
An AI-powered chat assistant that helps users create and manage their carpool profiles.
The assistant guides users through a series of questions to understand their carpooling needs and preferences.


[chatapp-demo.webm](https://github.com/user-attachments/assets/3ed06002-e6d5-44c2-b9f4-4cd708d8df2a)


## Features

- Interactive chat interface
- AI-powered conversation with Claude
- MongoDB database integration
- Redis state management
- User profile management
- Personalized greeting with user's name
- Suggestion buttons for quick responses
- Intelligent question handling and validation
- State-based conversation flow
- Multi-stage profile creation process

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Cache: Redis
- AI: Claude Haiku

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
│   │   ├── OptionalQuestionHandler.js
│   │   ├── StateManager.js
│   │   └── ValidationHandler.js
│   ├── prompts/        # AI prompt templates
│   │   ├── activity_question_prompt.js
│   │   ├── basic_question_prompt.js
│   │   ├── initial_question_prompt.js
│   │   ├── initial_validation_prompt.js
│   │   ├── optional_question_prompt.js
│   │   ├── optional_validation_prompt.js
│   │   ├── pref_question_prompt.js
│   │   ├── schedule_question_prompt.js
│   │   └── school_question_prompt.js
│   ├── vars/           # Enums and templates
│   │   ├── claudeEnum.js
│   │   ├── dependentTemplate.js
│   │   ├── questionTypeEnum.js
│   │   ├── stateEnum.js
│   │   └── vars.js
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

2. Create a .env file in the root directory and add your Claude API key:
```
CLAUDE_API_KEY=your_api_key_here
```

3. Start MongoDB and Redis services:
```bash
npm run db
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
- A `Claude` API Key is required. Please provide a key in .env file at root level
- Use `npm run db` to start both MongoDB and Redis services
- Use `npm run dev` to start the application server
