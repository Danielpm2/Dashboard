// Central route index file
const express = require('express');
const router = express.Router();

// Import individual route modules
const panelsRoutes = require('./panels');
const healthRoutes = require('./health');
const calendarRoutes = require('./calendar');
const authRoutes = require('./auth');

// Mount routes
router.use('/panels', panelsRoutes);
router.use('/health', healthRoutes);
router.use('/calendar', calendarRoutes);
router.use('/auth', authRoutes);

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
            calendarEventsFormatted: '/api/calendar/events/formatted',
            googleAuth: '/api/auth/google',
            authStatus: '/api/auth/status',
            authLogout: '/api/auth/logout'
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
                'POST /calendar/events': 'Create a new calendar event',
                'PUT /calendar/events/:eventId': 'Update an existing calendar event',
                'DELETE /calendar/events/:eventId': 'Delete a calendar event',
                'GET /calendar/test': 'Test calendar API connection'
            },
            auth: {
                'GET /auth/google': 'Start Google OAuth2 authentication',
                'GET /auth/google/callback': 'OAuth2 callback (automatic)',
                'GET /auth/status': 'Check authentication status',
                'POST /auth/logout': 'Logout and clear credentials'
            }
        }
    });
});

module.exports = router;
