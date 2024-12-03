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

## API Documentation

### AI Routes

#### Generate AI Response
- **Endpoint**: POST `/api/ai/generate`
- **Description**: Generates an AI response based on user input
- **Parameters**:
  - Query: `userId` (required)
  - Body: 
    - `prompt` (optional): User input text
    - `isNewSession` (optional): Boolean indicating if this is a new chat session
- **Usage**:
```json
{
  "prompt": "Hello",
  "isNewSession": false
}
```

#### Reset Profile
- **Endpoint**: POST `/api/ai/reset`
- **Description**: Resets a user's profile and starts a new chat session
- **Parameters**:
  - Body: `userId` (required)
- **Usage**:
```json
{
  "userId": "user_id_here"
}
```

### User Routes

#### Get All Users
- **Endpoint**: GET `/api/users`
- **Description**: Retrieves all users from the database

#### Get User by ID
- **Endpoint**: GET `/api/users/:id`
- **Description**: Retrieves a specific user by ID (checks cache first, then database)

#### Get Current Dependent Activity
- **Endpoint**: GET `/api/users/:id/current-match`
- **Description**: Retrieves current dependent and activity information for matching

#### Create New User
- **Endpoint**: POST `/api/users`
- **Description**: Creates a new user profile
- **Parameters**: User profile data in request body

#### Match Carpool
- **Endpoint**: POST `/api/users/:id/match-carpool`
- **Description**: Finds carpool matches for a specific dependent and activity
- **Parameters**:
  - Body:
    - `dependent_name` (required)
    - `activity_name` (required)
    - `radius` (optional): Search radius for matches
- **Usage**:
```json
{
  "dependent_name": "John",
  "activity_name": "Soccer",
  "radius": 5
}
```

#### Update User
- **Endpoint**: PUT `/api/users/:id`
- **Description**: Updates an existing user's profile
- **Parameters**: Updated user data in request body

#### Sync Cache to Database
- **Endpoint**: PATCH `/api/users/:id/sync-cache`
- **Description**: Synchronizes cached user data with the database

#### Delete User
- **Endpoint**: DELETE `/api/users/:id`
- **Description**: Deletes a user's profile and cached data

### Geocoding Routes

#### Geocode Address
- **Endpoint**: POST `/api/geocode`
- **Description**: Converts a text address into geographic coordinates
- **Parameters**:
  - Body: `address` (required)
- **Usage**:
```json
{
  "address": "123 Main St, City, State 12345"
}
```

## Development
- A `ANTHROPIC_API_KEY` API Key is required. Please provide a key in .env file at root level
- A `GOOGLE_MAPS_API_KEY` API Key is required. Please provide a key in .env file at root level
- Use `npm run db` to start both MongoDB and Redis services
- Use `npm run dev` to start the application server
