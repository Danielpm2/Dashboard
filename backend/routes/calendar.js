const express = require('express');
const router = express.Router();
const googleCalendarService = require('../api/GoogleCalendarService');

// Get calendar events (formatted for dashboard)
router.get('/events/formatted', async (req, res) => {
    try {
        console.log('Fetching formatted calendar events...');
        
        // Load stored credentials if available
        googleCalendarService.loadStoredCredentials();
        
        const events = await googleCalendarService.getCalendarEvents();
        
        // Format events for dashboard display
        const formattedEvents = events.map(event => {
            // Handle both dateTime and date (all-day events)
            const startDateTime = event.start;
            const endDateTime = event.end;
            
            let startDate, endDate;
            
            // Check if it's an all-day event (has only date, not dateTime)
            const isAllDay = !startDateTime.includes('T');
            
            if (isAllDay) {
                startDate = new Date(startDateTime + 'T00:00:00');
                endDate = new Date(endDateTime + 'T23:59:59');
            } else {
                startDate = new Date(startDateTime);
                endDate = new Date(endDateTime);
            }
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            
            return {
                ...event,
                formattedTime: googleCalendarService.formatEventTime(startDateTime, endDateTime),
                isToday: eventDate.getTime() === today.getTime(),
                isTomorrow: eventDate.getTime() === today.getTime() + (24 * 60 * 60 * 1000),
                isOngoing: now >= startDate && now <= endDate,
                isAllDay: isAllDay
            };
        });
        
        // Group events by date
        const groupedEvents = googleCalendarService.groupEventsByDate(formattedEvents);
        
        res.json({
            success: true,
            events: formattedEvents,
            groupedEvents: groupedEvents,
            total: formattedEvents.length,
            authenticated: googleCalendarService.isAuthenticated()
        });
        
    } catch (error) {
        console.error('Error fetching formatted calendar events:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            authenticated: googleCalendarService.isAuthenticated()
        });
    }
});

// Get raw calendar events
router.get('/events', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        const events = await googleCalendarService.getCalendarEvents();
        
        res.json({
            success: true,
            events: events,
            total: events.length,
            authenticated: googleCalendarService.isAuthenticated()
        });
        
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            authenticated: googleCalendarService.isAuthenticated()
        });
    }
});

// Get a single calendar event
router.get('/events/:eventId', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.'
            });
        }

        const { eventId } = req.params;
        const event = await googleCalendarService.getEvent(eventId);
        
        res.json({
            success: true,
            event: event
        });
        
    } catch (error) {
        console.error('Error fetching calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create a new calendar event
router.post('/events', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.',
                authUrl: '/api/auth/google'
            });
        }

        const eventData = req.body;
        const newEvent = await googleCalendarService.createEvent(eventData);
        
        res.json({
            success: true,
            event: newEvent,
            message: 'Event created successfully'
        });
        
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update a calendar event
router.put('/events/:eventId', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.'
            });
        }

        const { eventId } = req.params;
        const eventData = req.body;
        const updatedEvent = await googleCalendarService.updateEvent(eventId, eventData);
        
        res.json({
            success: true,
            event: updatedEvent,
            message: 'Event updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a calendar event
router.delete('/events/:eventId', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.'
            });
        }

        const { eventId } = req.params;
        const result = await googleCalendarService.deleteEvent(eventId);
        
        res.json({
            success: true,
            result: result,
            message: 'Event deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test calendar connection
router.get('/test', async (req, res) => {
    try {
        googleCalendarService.loadStoredCredentials();
        const isAuthenticated = googleCalendarService.isAuthenticated();
        
        res.json({
            success: true,
            message: 'Calendar service is running',
            authenticated: isAuthenticated,
            authUrl: isAuthenticated ? null : '/api/auth/google',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error testing calendar:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
