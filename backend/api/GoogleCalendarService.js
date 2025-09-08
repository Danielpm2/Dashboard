const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = null;
        this.calendar = null;
        this.credentialsPath = path.join(__dirname, '..', 'config', 'google-credentials.json');
        this.initializeAuth();
    }

    initializeAuth() {
        try {
            console.log('🔑 Initializing Google Calendar OAuth2...');
            
            // Initialize OAuth2 client
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
            );

            // Set up calendar with OAuth2
            this.calendar = google.calendar({ 
                version: 'v3', 
                auth: this.oauth2Client
            });

            // Load stored credentials on startup
            this.loadStoredCredentials();
            console.log('✅ Google Calendar service initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Google Calendar auth:', error);
        }
    }

    // Generate OAuth2 authorization URL
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    // Set credentials from OAuth2 callback
    async setCredentials(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            // Save credentials to file for persistence
            await this.saveCredentials(tokens);
            
            console.log('✅ Google Calendar credentials set and saved');
            return tokens;
        } catch (error) {
            console.error('❌ Error setting credentials:', error);
            throw error;
        }
    }

    // Save credentials to file
    async saveCredentials(tokens) {
        try {
            const credentialsDir = path.dirname(this.credentialsPath);
            if (!fs.existsSync(credentialsDir)) {
                fs.mkdirSync(credentialsDir, { recursive: true });
            }
            
            const credentialsData = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
                token_type: tokens.token_type,
                expiry_date: tokens.expiry_date,
                saved_at: new Date().toISOString()
            };
            
            fs.writeFileSync(this.credentialsPath, JSON.stringify(credentialsData, null, 2));
            console.log('💾 Credentials saved successfully');
        } catch (error) {
            console.error('❌ Error saving credentials:', error);
        }
    }

    // Load existing credentials from file
    loadStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                const credentialsData = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
                
                if (credentialsData.refresh_token) {
                    this.oauth2Client.setCredentials({
                        access_token: credentialsData.access_token,
                        refresh_token: credentialsData.refresh_token,
                        scope: credentialsData.scope,
                        token_type: credentialsData.token_type,
                        expiry_date: credentialsData.expiry_date
                    });
                    console.log('📂 Stored Google Calendar credentials loaded');
                    return true;
                }
            }
            console.log('⚠️ No stored credentials found');
            return false;
        } catch (error) {
            console.error('❌ Error loading stored credentials:', error);
            return false;
        }
    }

    // Clear stored credentials
    clearStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                fs.unlinkSync(this.credentialsPath);
                console.log('🗑️ Stored credentials cleared');
            }
            this.oauth2Client.setCredentials({});
        } catch (error) {
            console.error('❌ Error clearing stored credentials:', error);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.oauth2Client && this.oauth2Client.credentials && 
               (this.oauth2Client.credentials.access_token || this.oauth2Client.credentials.refresh_token);
    }

    // Get raw calendar events (unformatted)
    async getCalendarEventsRaw(calendarId = 'primary', options = {}) {
        try {
            if (!this.isAuthenticated()) {
                console.log('⚠️ User not authenticated, using mock data');
                return [];
            }

            if (!this.calendar) {
                throw new Error('Google Calendar not initialized');
            }

            const now = new Date();
            const startDate = options.timeMin || new Date(now.setHours(0, 0, 0, 0));
            const endDate = options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            const maxResults = options.maxResults || 50;

            console.log(`📅 Fetching Google Calendar events from ${calendarId}...`);
            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items || [];
            console.log(`✅ Found ${events.length} calendar events from ${calendarId}`);
            
            return events;

        } catch (error) {
            console.error(`❌ Error fetching calendar events from ${calendarId}:`, error);
            return [];
        }
    }

    // Get calendar events (formatted)
    async getCalendarEvents(calendarId = 'primary', options = {}) {
        try {
            const rawEvents = await this.getCalendarEventsRaw(calendarId, options);
            if (rawEvents.length === 0 && !this.isAuthenticated()) {
                console.log('⚠️ Falling back to mock data');
                return this.getMockEvents();
            }
            
            // Get calendar color for this specific calendar
            let calendarColor = null;
            try {
                const calendars = await this.getCalendarList();
                const calendar = calendars.find(cal => cal.id === calendarId);
                if (calendar) {
                    calendarColor = {
                        backgroundColor: calendar.backgroundColor,
                        foregroundColor: calendar.foregroundColor,
                        colorId: calendar.colorId
                    };
                }
            } catch (colorError) {
                console.log('⚠️ Could not fetch calendar color information');
            }
            
            return rawEvents.map(event => this.formatEvent(event, calendarColor));

        } catch (error) {
            console.error('❌ Error fetching calendar events:', error);
            console.log('⚠️ Falling back to mock data');
            return this.getMockEvents();
        }
    }

    // Get events from multiple calendars
    async getEventsFromMultipleCalendars(calendarIds = ['primary'], options = {}) {
        try {
            if (!this.isAuthenticated()) {
                console.log('⚠️ User not authenticated, using mock data');
                return this.getMockEvents();
            }

            // Get calendar list to map calendar colors
            const calendars = await this.getCalendarList();
            const calendarColorMap = {};
            calendars.forEach(cal => {
                calendarColorMap[cal.id] = {
                    backgroundColor: cal.backgroundColor,
                    foregroundColor: cal.foregroundColor,
                    colorId: cal.colorId
                };
            });
            


            const allEvents = [];
            
            // Fetch events from each selected calendar
            for (const calendarId of calendarIds) {
                try {
                    const rawEvents = await this.getCalendarEventsRaw(calendarId, options);
                    // Format events with calendar color information and add calendar metadata
                    const eventsWithCalendar = rawEvents.map(event => {
                        const formattedEvent = this.formatEvent(event, calendarColorMap[calendarId]);
                        return {
                            ...formattedEvent,
                            calendarId: calendarId,
                            calendarColor: calendarColorMap[calendarId]
                        };
                    });
                    allEvents.push(...eventsWithCalendar);
                } catch (error) {
                    console.error(`❌ Error fetching events from calendar ${calendarId}:`, error);
                    // Continue with other calendars
                }
            }

            // Sort all events by start time
            allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
            
            console.log(`✅ Found ${allEvents.length} events from ${calendarIds.length} calendars`);
            return allEvents;

        } catch (error) {
            console.error('❌ Error fetching events from multiple calendars:', error);
            return this.getMockEvents();
        }
    }

    // Format event for consistent API response
    formatEvent(event, calendarColor = null) {
        // Determine color priority: event color > calendar color > default color
        let eventColor;
        
        if (event.colorId) {
            // Event has its own color - use Google Calendar event color
            eventColor = this.getEventColor(event.colorId);
        } else if (calendarColor && calendarColor.backgroundColor) {
            // No event color, use calendar color
            eventColor = {
                background: calendarColor.backgroundColor,
                foreground: calendarColor.foregroundColor || '#ffffff'
            };
        } else {
            // Fallback to default color
            eventColor = this.getEventColor('9'); // Default blue
        }

        return {
            id: event.id,
            summary: event.summary || 'Untitled Event',
            title: event.summary || 'Untitled Event', // For compatibility
            description: event.description || '',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            isAllDay: !event.start.dateTime,
            location: event.location || '',
            htmlLink: event.htmlLink,
            status: event.status,
            created: event.created,
            updated: event.updated,
            colorId: event.colorId || null,
            color: eventColor,
            calendarId: event.calendarId,
            recurringEventId: event.recurringEventId
        };
    }

    // Get Google Calendar event color
    getEventColor(colorId) {
        // Google Calendar event colors mapping
        const googleCalendarColors = {
            '1': { background: '#a4bdfc', foreground: '#1d1d1d' }, // Lavender
            '2': { background: '#7ae7bf', foreground: '#1d1d1d' }, // Sage
            '3': { background: '#dbadff', foreground: '#1d1d1d' }, // Grape
            '4': { background: '#ff887c', foreground: '#1d1d1d' }, // Flamingo
            '5': { background: '#fbd75b', foreground: '#1d1d1d' }, // Banana
            '6': { background: '#ffb878', foreground: '#1d1d1d' }, // Tangerine
            '7': { background: '#46d6db', foreground: '#1d1d1d' }, // Peacock
            '8': { background: '#e1e1e1', foreground: '#1d1d1d' }, // Graphite
            '9': { background: '#5484ed', foreground: '#ffffff' }, // Blueberry
            '10': { background: '#51b749', foreground: '#ffffff' }, // Basil
            '11': { background: '#dc2127', foreground: '#ffffff' }  // Tomato
        };

        // Default to blue if no colorId or colorId not found
        return googleCalendarColors[colorId] || googleCalendarColors['9'];
    }

    // Create a new calendar event
    async createEvent(eventData) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const event = {
                summary: eventData.summary || eventData.title,
                description: eventData.description || '',
                location: eventData.location || ''
            };

            // Handle start/end times
            if (eventData.isAllDay) {
                event.start = { date: eventData.startDate };
                event.end = { date: eventData.endDate };
            } else {
                event.start = { 
                    dateTime: eventData.start || eventData.startDateTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                };
                event.end = { 
                    dateTime: eventData.end || eventData.endDateTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                };
            }

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            console.log('✅ Event created:', response.data.id);
            return this.formatEvent(response.data);

        } catch (error) {
            console.error('❌ Error creating event:', error);
            throw error;
        }
    }

    // Update an existing calendar event
    async updateEvent(eventId, eventData) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const event = {
                summary: eventData.summary || eventData.title,
                description: eventData.description || '',
                location: eventData.location || ''
            };

            // Handle start/end times
            if (eventData.isAllDay) {
                event.start = { date: eventData.startDate };
                event.end = { date: eventData.endDate };
            } else {
                event.start = { 
                    dateTime: eventData.start || eventData.startDateTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                };
                event.end = { 
                    dateTime: eventData.end || eventData.endDateTime,
                    timeZone: eventData.timeZone || 'America/New_York'
                };
            }

            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
            });

            console.log('✅ Event updated:', response.data.id);
            return this.formatEvent(response.data);

        } catch (error) {
            console.error('❌ Error updating event:', error);
            throw error;
        }
    }

    // Delete a calendar event
    async deleteEvent(eventId) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });

            console.log('✅ Event deleted:', eventId);
            return { success: true, id: eventId };

        } catch (error) {
            console.error('❌ Error deleting event:', error);
            throw error;
        }
    }

    // Get events grouped by date
    async getEventsGroupedByDate(options = {}, calendarIds = ['primary']) {
        let events;
        if (calendarIds.length === 1) {
            events = await this.getCalendarEvents(calendarIds[0], options);
        } else {
            events = await this.getEventsFromMultipleCalendars(calendarIds, options);
        }
        return this.groupEventsByDate(events);
    }

    // Group events by date
    groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const eventDate = new Date(event.start);
            // Use ISO date format (YYYY-MM-DD) for consistency with frontend
            const dateKey = eventDate.toISOString().split('T')[0];
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push({
                ...event,
                formattedTime: this.formatEventTime(event.start, event.end),
                isToday: this.isToday(eventDate),
                isTomorrow: this.isTomorrow(eventDate),
                isOngoing: this.isEventOngoing(event.start, event.end)
            });
        });
        
        // Sort dates
        const sortedGrouped = {};
        Object.keys(grouped)
            .sort((a, b) => new Date(a) - new Date(b))
            .forEach(key => {
                sortedGrouped[key] = grouped[key];
            });
        
        return sortedGrouped;
    }

    // Format event time for display
    formatEventTime(start, end) {
        try {
            const isAllDay = !start.includes('T');
            
            if (isAllDay) {
                const startDate = new Date(start + 'T00:00:00');
                return 'All Day';
            }
            
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return 'Invalid Date';
            }
            
            const startTime = startDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const endTime = endDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `${startTime} - ${endTime}`;
        } catch (error) {
            console.error('❌ Error formatting event time:', error);
            return 'Time unavailable';
        }
    }

    // Check if date is today
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // Check if date is tomorrow
    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    // Check if event is currently ongoing
    isEventOngoing(start, end) {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);
        return now >= startDate && now <= endDate;
    }

    // Get user's calendar list
    async getCalendarList() {
        try {
            if (!this.oauth2Client || !this.oauth2Client.credentials.access_token) {
                console.log('📋 No authentication, returning mock calendar list');
                return this.getMockCalendarList();
            }

            const response = await this.calendar.calendarList.list();
            
            const calendars = response.data.items.map(cal => ({
                id: cal.id,
                name: cal.summary,
                description: cal.description || '',
                primary: cal.primary || false,
                selected: cal.selected !== false, // Default to selected unless explicitly false
                accessRole: cal.accessRole,
                backgroundColor: cal.backgroundColor,
                foregroundColor: cal.foregroundColor,
                colorId: cal.colorId
            }));

            console.log(`📋 Found ${calendars.length} calendars`);
            return calendars;

        } catch (error) {
            console.error('❌ Error fetching calendar list:', error);
            return this.getMockCalendarList();
        }
    }

    // Get mock calendar list for testing
    getMockCalendarList() {
        return [
            {
                id: 'primary',
                name: 'Personal Calendar',
                description: 'Your personal calendar',
                primary: true,
                selected: true,
                accessRole: 'owner',
                backgroundColor: '#5484ed',
                foregroundColor: '#ffffff',
                colorId: '9'
            },
            {
                id: 'work-calendar',
                name: 'Work Calendar',
                description: 'Work-related events and meetings',
                primary: false,
                selected: true,
                accessRole: 'owner',
                backgroundColor: '#51b749',
                foregroundColor: '#ffffff',
                colorId: '10'
            },
            {
                id: 'family-calendar',
                name: 'Family Events',
                description: 'Family gatherings and events',
                primary: false,
                selected: false,
                accessRole: 'reader',
                backgroundColor: '#dc2127',
                foregroundColor: '#ffffff',
                colorId: '11'
            }
        ];
    }

    // Generate mock events for testing
    getMockEvents() {
        const now = new Date();
        const events = [];
        
        // Today's events
        events.push({
            id: 'mock-today-1',
            title: 'Team Standup',
            summary: 'Team Standup',
            description: 'Daily team synchronization meeting',
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString(),
            location: 'Conference Room A',
            status: 'confirmed',
            isAllDay: false
        });
        
        events.push({
            id: 'mock-today-2',
            title: 'Project Review',
            summary: 'Project Review',
            description: 'Review progress on dashboard project',
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(),
            location: 'Online',
            status: 'confirmed',
            isAllDay: false
        });

        // Tomorrow's events
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        events.push({
            id: 'mock-tomorrow-1',
            title: 'Client Meeting',
            summary: 'Client Meeting',
            description: 'Discuss project requirements and timeline',
            start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0).toISOString(),
            end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0).toISOString(),
            location: 'Client Office',
            status: 'confirmed',
            isAllDay: false
        });

        // All-day event
        events.push({
            id: 'mock-allday-1',
            title: 'Conference Day',
            summary: 'Conference Day',
            description: 'Annual tech conference',
            start: tomorrow.toISOString().split('T')[0],
            end: tomorrow.toISOString().split('T')[0],
            location: 'Convention Center',
            status: 'confirmed',
            isAllDay: true
        });
        
        return events.map(event => this.formatEvent(event));
    }
}

module.exports = new GoogleCalendarService();
