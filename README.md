# Product-18---Independent-Kids

## Carpool Profile Assistant
An AI-powered chat assistant that helps users create and manage their carpool profiles.
The assistant guides users through a series of questions to understand their carpooling needs and preferences.

![Chat Interface Screenshot](/public/images/chat-screenshot.png)

## Features

- Interactive chat interface
- AI-powered conversation
- MongoDB database integration
- User profile management
- Personalized greeting with user's name
- Suggestion buttons for quick responses

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- AI: llama3.2:3b model

## Project Structure

```
├── config/
│   └── db.js           # MongoDB configuration
├── db/
│   ├── models/         # Database models
│   └── seeders/        # Database seeders
├── routes/
│   ├── aiRoutes.js     # AI-related routes
│   └── userRoutes.js   # User-related routes
├── public/
│   └── images/         # Static images
├── app.js              # Express application setup
├── chat.js            # Chat interface logic
└── routes.js          # Main route configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service:
```bash
sudo service mongodb start
```

3. Seed the database:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## API Endpoints

### AI Routes
- POST `/api/ai/generate` - Generate AI response
- GET `/api/ai/first-question` - Get initial question
- POST `/api/ai/reset` - Reset user profile

### User Routes
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## Development

The project uses `concurrently` to run both the MongoDB service and the Node.js server in development mode. Use `npm run dev` to start both services simultaneously.
