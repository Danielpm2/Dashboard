const cors = require('cors');
const express = require('express');
const config = require('./config');

// CORS configuration
const corsOptions = {
    origin: config.cors.origins,
    credentials: config.cors.credentials,
    optionsSuccessStatus: 200
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Default error response
    let status = 500;
    let message = 'Internal Server Error';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    } else if (err.message) {
        message = err.message;
    }
    
    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString()
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
};

// JSON body parser with error handling
const jsonParser = () => {
    return express.json({
        limit: '10mb',
        verify: (req, res, buf, encoding) => {
            try {
                JSON.parse(buf);
            } catch (e) {
                throw new Error('Invalid JSON');
            }
        }
    });
};

module.exports = {
    corsOptions,
    errorHandler,
    requestLogger,
    jsonParser,
    cors: cors(corsOptions)
};
