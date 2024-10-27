const express = require('express');
const cors = require('cors');

// Setup basic middleware
const setupBasicMiddleware = (app) => {
    app.use(cors());
    app.use(express.json());
    app.use(express.static(__dirname));
};

// Debug middleware
const debugMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
};

// Error handling middleware
const errorHandlingMiddleware = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
};

// Global error handlers
const setupGlobalErrorHandlers = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
    });
};

module.exports = {
    setupBasicMiddleware,
    debugMiddleware,
    errorHandlingMiddleware,
    setupGlobalErrorHandlers
};
