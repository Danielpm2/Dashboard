const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Dashboard API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Detailed health check with database status
router.get('/detailed', async (req, res) => {
    try {
        const { getConnection } = require('../api/database');
        
        // Test database connection
        const db = await getConnection();
        await db.execute('SELECT 1');
        await db.end();
        
        res.json({
            status: 'OK',
            message: 'Dashboard API is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            database: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
