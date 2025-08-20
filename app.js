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
const trustRoutes = require('./routes/trustRoutes');
const { loadModels } = require('./services/localVisionClient');

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Load AI models before server starts
    console.log('[Startup] Loading face detection models...');
    await loadModels();
    console.log('[Startup] Face detection models loaded successfully.');

    // Connect to MongoDB
    await connectDB();
    console.log('[Startup] MongoDB connected successfully.');

    // Connect to Redis
    await redisClient.connect();
    console.log('[Startup] Redis connected successfully.');

    // Middleware
    setupBasicMiddleware(app);
    app.use(debugMiddleware);

    // Routes
    app.use('/', routes);
    app.use('/api/geocode', geocodeRoutes);
    app.use('/api/trust', trustRoutes);

    // Error handling middleware
    app.use(errorHandlingMiddleware);

    // Global error handlers
    setupGlobalErrorHandlers();

    // Start server
    app.listen(port, () => {
      console.log(`[Server] Running at http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Shutdown] SIGTERM received. Closing server...');
      await redisClient.quit();
      process.exit(0);
    });

  } catch (error) {
    console.error('[Startup Error]', error);
    process.exit(1);
  }
})();
