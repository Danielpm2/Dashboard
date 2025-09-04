const express = require('express');
const router = express.Router();
const googleCalendar = require('../api/googleCalendar');

// Get calendar events
router.get('/events', async (req, res) => {
    try {
        const { calendarId, maxResults } = req.query;
        
        const events = await googleCalendar.getCalendarEvents(
            calendarId || 'primary',
            parseInt(maxResults) || 10
        );
        
        const groupedEvents = googleCalendar.groupEventsByDate(events);
        
        res.json({
            success: true,
            events: events,
            groupedEvents: groupedEvents,
            total: events.length
        });
        
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch calendar events',
            message: error.message
        });
    }
});

// Get formatted events for display
router.get('/events/formatted', async (req, res) => {
    try {
        const { calendarId, maxResults } = req.query;
        
        const events = await googleCalendar.getCalendarEvents(
            calendarId || 'primary',
            parseInt(maxResults) || 10
        );
        
        const formattedEvents = events.map(event => ({
            ...event,
            formattedTime: googleCalendar.formatEventTime(event.start, event.end),
            isToday: new Date(event.start).toDateString() === new Date().toDateString(),
            isTomorrow: new Date(event.start).toDateString() === new Date(Date.now() + 86400000).toDateString()
        }));
        
        const groupedEvents = googleCalendar.groupEventsByDate(formattedEvents);
        
        res.json({
            success: true,
            events: formattedEvents,
            groupedEvents: groupedEvents,
            total: formattedEvents.length
        });
        
    } catch (error) {
        console.error('Error fetching formatted calendar events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch calendar events',
            message: error.message
        });
    }
});

// Test endpoint to verify calendar API is working
router.get('/test', async (req, res) => {
    try {
        const mockEvents = googleCalendar.getMockEvents();
        
        res.json({
            success: true,
            message: 'Google Calendar API service is running',
            mockEvents: mockEvents.length,
            sampleEvent: mockEvents[0] || null
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Calendar service error',
            message: error.message
        });
    }
});

module.exports = router;
