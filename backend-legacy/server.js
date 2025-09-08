const express = require('express');

// Import configuration
const config = require('./api/config');

// Import custom modules
const { initDatabase } = require('./api/database');
const { cors, errorHandler, requestLogger, jsonParser } = require('./api/middleware');

// Import routes
const apiRoutes = require('./routes/index');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(requestLogger);
app.use(cors);
app.use(jsonParser());

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Dashboard API Server',
        version: config.api.version,
        environment: config.server.env,
        endpoints: {
            api: `${config.api.prefix}`,
            health: `${config.api.prefix}/health`,
            panels: `${config.api.prefix}/panels`
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Dashboard API server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    
    // Initialize database
    await initDatabase();
});

module.exports = app;
