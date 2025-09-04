// Central route index file
const express = require('express');
const router = express.Router();

// Import individual route modules
const panelsRoutes = require('./panels');
const healthRoutes = require('./health');
const calendarRoutes = require('./calendar');

// Mount routes
router.use('/panels', panelsRoutes);
router.use('/health', healthRoutes);
router.use('/calendar', calendarRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Dashboard API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            healthDetailed: '/api/health/detailed',
            panels: '/api/panels',
            specificPanel: '/api/panels/:panelKey',
            calendar: '/api/calendar',
            calendarEvents: '/api/calendar/events',
            calendarEventsFormatted: '/api/calendar/events/formatted'
        },
        documentation: {
            panels: {
                'GET /panels': 'Get all panels with widgets',
                'POST /panels': 'Save panels configuration',
                'GET /panels/:panelKey': 'Get specific panel'
            },
            health: {
                'GET /health': 'Basic health check',
                'GET /health/detailed': 'Detailed health check with database status'
            },
            calendar: {
                'GET /calendar/events': 'Get Google Calendar events (raw)',
                'GET /calendar/events/formatted': 'Get formatted calendar events for dashboard',
                'GET /calendar/test': 'Test calendar API connection'
            }
        }
    });
});

module.exports = router;
