const express = require('express');
const routes = require('./routes/routes');
const connectDB = require('./config/db');
const { redisClient } = require('./config/redis');
const {
  setupBasicMiddleware,
  debugMiddleware,
  errorHandlingMiddleware,
  setupGlobalErrorHandlers
} = require('./middleware');
const geocodeRoutes = require('./routes/geocodeRoutes');

const app = express();
const port = 3000;

// Connect to MongoDB and Redis
(async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    await redisClient.connect();
    console.log('Redis connected successfully');

  } catch (error) {
    console.error('Error connecting to databases:', error);
    process.exit(1);
  }
})();

// Setup middleware
setupBasicMiddleware(app);
app.use(debugMiddleware);

// Use routes
app.use('/', routes);
app.use('/api/geocode', geocodeRoutes);

// Error handling
app.use(errorHandlingMiddleware);

// Setup global error handlers
setupGlobalErrorHandlers();

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connections...');
  await redisClient.quit();
  process.exit(0);
});
