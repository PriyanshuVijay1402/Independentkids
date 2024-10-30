const express = require('express');
const routes = require('./routes');
const connectDB = require('./config/db');
const {
  setupBasicMiddleware,
  debugMiddleware,
  errorHandlingMiddleware,
  setupGlobalErrorHandlers
} = require('./middleware');

const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();

// Setup middleware
setupBasicMiddleware(app);
app.use(debugMiddleware);

// Use routes
app.use('/', routes);

// Error handling
app.use(errorHandlingMiddleware);

// Setup global error handlers
setupGlobalErrorHandlers();

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
