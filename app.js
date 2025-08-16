const express = require('express');
const routes = require('./routes/routes');
const connectDB = require('./config/db');
const ocrRoutes = require('./routes/ocrRoutes');// Add this for OCR routing
const feedbackRoutes = require('./routes/feedbackRoutes');
const { redisClient } = require('./config/redis');
const {
  setupBasicMiddleware,
  debugMiddleware,
  errorHandlingMiddleware,
  setupGlobalErrorHandlers
} = require('./middleware');
const geocodeRoutes = require('./routes/geocodeRoutes');

// New: Import userRoutes
const userRoutes = require('./routes/userRoutes');


 

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

// New: Add user-related routes under /api/users
app.use('/api/users', userRoutes);

app.use('/api/ocr', ocrRoutes); // This connects OCR routes

// Feedback route after app is defined
app.use('/api/feedback', feedbackRoutes);

// Add ride-related route (for drop-off photo upload)
const rideRoutes = require('./routes/rideRoutes');
app.use('/api', rideRoutes);

// after your other route imports
const rematchRoutes = require('./routes/rematchRoutes');
app.use('/api/rematch', rematchRoutes);


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
