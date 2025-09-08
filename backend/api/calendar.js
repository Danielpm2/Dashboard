const express = require('express');
const router = express.Router();
const googleCalendarService = require('../api/GoogleCalendarService');

// Get calendar events
router.get('/events', async (req, res) => {
    try {
        console.log('📅 GET /api/calendar/events');
        
        const { 
            maxResults = 50, 
            timeMin, 
            timeMax,
            grouped = false,
            calendars
        } = req.query;

        const options = {
            maxResults: parseInt(maxResults),
            timeMin: timeMin ? new Date(timeMin) : undefined,
            timeMax: timeMax ? new Date(timeMax) : undefined
        };

        // Parse calendar IDs from query parameter
        let calendarIds = ['primary'];
        if (calendars) {
            try {
                calendarIds = JSON.parse(calendars);
                if (!Array.isArray(calendarIds)) {
                    calendarIds = [calendars];
                }
            } catch (error) {
                console.log('⚠️ Error parsing calendars parameter, using primary calendar');
                calendarIds = ['primary'];
            }
        }

        let events;
        if (grouped === 'true') {
            const groupedEvents = await googleCalendarService.getEventsGroupedByDate(options, calendarIds);
            const flatEvents = Object.values(groupedEvents).flat();
            
            res.json({
                success: true,
                events: flatEvents,
                grouped: groupedEvents,
                total: flatEvents.length,
                authenticated: googleCalendarService.isAuthenticated(),
                options: options,
                selectedCalendars: calendarIds
            });
        } else {
            if (calendarIds.length === 1) {
                events = await googleCalendarService.getCalendarEvents(calendarIds[0], options);
            } else {
                events = await googleCalendarService.getEventsFromMultipleCalendars(calendarIds, options);
            }
            
            res.json({
                success: true,
                events: events,
                total: Array.isArray(events) ? events.length : Object.keys(events).length,
                authenticated: googleCalendarService.isAuthenticated(),
                options: options,
                selectedCalendars: calendarIds
            });
        }
        
    } catch (error) {
        console.error('❌ Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            authenticated: googleCalendarService.isAuthenticated()
        });
    }
});

// Get events for today
router.get('/events/today', async (req, res) => {
    try {
        console.log('📅 GET /api/calendar/events/today');
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const options = {
            timeMin: startOfDay,
            timeMax: endOfDay,
            maxResults: 20
        };

        const events = await googleCalendarService.getCalendarEvents('primary', options);
        
        res.json({
            success: true,
            events: events,
            date: startOfDay.toISOString().split('T')[0],
            total: events.length,
            authenticated: googleCalendarService.isAuthenticated()
        });
        
    } catch (error) {
        console.error('❌ Error fetching today\'s events:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            authenticated: googleCalendarService.isAuthenticated()
        });
    }
});

// Get upcoming events (next 7 days)
router.get('/events/upcoming', async (req, res) => {
    try {
        console.log('📅 GET /api/calendar/events/upcoming');
        
        const now = new Date();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const options = {
            timeMin: now,
            timeMax: nextWeek,
            maxResults: 30
        };

        const events = await googleCalendarService.getCalendarEvents('primary', options);
        
        res.json({
            success: true,
            events: events,
            timeRange: {
                start: now.toISOString(),
                end: nextWeek.toISOString()
            },
            total: events.length,
            authenticated: googleCalendarService.isAuthenticated()
        });
        
    } catch (error) {
        console.error('❌ Error fetching upcoming events:', error);
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
        const { eventId } = req.params;
        console.log(`📅 GET /api/calendar/events/${eventId}`);
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.',
                authUrl: '/api/auth/google'
            });
        }

        const event = await googleCalendarService.getEvent(eventId);
        
        res.json({
            success: true,
            event: googleCalendarService.formatEvent(event)
        });
        
    } catch (error) {
        console.error('❌ Error fetching calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create a new calendar event
router.post('/events', async (req, res) => {
    try {
        console.log('📅 POST /api/calendar/events');
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.',
                authUrl: '/api/auth/google'
            });
        }

        const eventData = req.body;
        
        // Validate required fields
        if (!eventData.summary && !eventData.title) {
            return res.status(400).json({
                success: false,
                error: 'Event title/summary is required'
            });
        }

        if (!eventData.start && !eventData.startDateTime && !eventData.startDate) {
            return res.status(400).json({
                success: false,
                error: 'Event start time is required'
            });
        }

        const newEvent = await googleCalendarService.createEvent(eventData);
        
        res.status(201).json({
            success: true,
            event: newEvent,
            message: 'Event created successfully'
        });
        
    } catch (error) {
        console.error('❌ Error creating calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update a calendar event
router.put('/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(`📅 PUT /api/calendar/events/${eventId}`);
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.'
            });
        }

        const eventData = req.body;
        const updatedEvent = await googleCalendarService.updateEvent(eventId, eventData);
        
        res.json({
            success: true,
            event: updatedEvent,
            message: 'Event updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a calendar event
router.delete('/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(`📅 DELETE /api/calendar/events/${eventId}`);
        
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please login with Google first.'
            });
        }

        const result = await googleCalendarService.deleteEvent(eventId);
        
        res.json({
            success: true,
            result: result,
            message: 'Event deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting calendar event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get calendar list
router.get('/calendars', async (req, res) => {
    try {
        console.log('📋 GET /api/calendar/calendars');
        
        const calendars = await googleCalendarService.getCalendarList();
        
        res.json({
            success: true,
            calendars: calendars,
            total: calendars.length,
            authenticated: googleCalendarService.isAuthenticated()
        });
        
    } catch (error) {
        console.error('❌ Error fetching calendar list:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            authenticated: googleCalendarService.isAuthenticated()
        });
    }
});

// Update calendar list settings (selected calendars)
router.put('/calendars/settings', async (req, res) => {
    try {
        console.log('📋 PUT /api/calendar/calendars/settings');
        
        const { selectedCalendars } = req.body;
        
        if (!Array.isArray(selectedCalendars)) {
            return res.status(400).json({
                success: false,
                error: 'selectedCalendars must be an array'
            });
        }
        
        // For now, we'll just return success - in a real app you'd store this in a database
        // or user preferences
        res.json({
            success: true,
            message: 'Calendar settings updated',
            selectedCalendars: selectedCalendars
        });
        
    } catch (error) {
        console.error('❌ Error updating calendar settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test calendar connection
router.get('/test', async (req, res) => {
    try {
        console.log('📅 GET /api/calendar/test');
        
        const isAuthenticated = googleCalendarService.isAuthenticated();
        
        res.json({
            success: true,
            message: 'Calendar service is running',
            authenticated: isAuthenticated,
            authUrl: isAuthenticated ? null : '/api/auth/google',
            timestamp: new Date().toISOString(),
            service: 'Google Calendar API v3'
        });
        
    } catch (error) {
        console.error('❌ Error testing calendar:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
