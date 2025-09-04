const { google } = require('googleapis');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.calendar = null;
        this.initializeAuth();
    }

    initializeAuth() {
        try {
            console.log('Initializing Google Calendar with API key:', process.env.GOOGLE_CALENDAR_API_KEY ? 'Present' : 'Missing');
            
            // Simple API Key authentication
            this.calendar = google.calendar({ 
                version: 'v3', 
                auth: process.env.GOOGLE_CALENDAR_API_KEY || 'your_api_key_here'
            });

        } catch (error) {
            console.error('Failed to initialize Google Calendar auth:', error);
        }
    }

    async getCalendarEvents(calendarId = 'primary', maxResults = 10) {
        try {
            // For now, always use mock data since OAuth2 setup is complex
            console.log('Using mock calendar data for demonstration');
            return this.getMockEvents();
            
            /* Uncomment this section when you have proper OAuth2 setup:
            
            if (!this.calendar) {
                throw new Error('Google Calendar not initialized');
            }

            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30); // Next 30 days

            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: now.toISOString(),
                timeMax: endDate.toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items || [];
            
            return events.map(event => ({
                id: event.id,
                title: event.summary || 'Untitled Event',
                description: event.description || '',
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                location: event.location || '',
                htmlLink: event.htmlLink,
                status: event.status,
                created: event.created,
                updated: event.updated
            }));
            */

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            return this.getMockEvents();
        }
    }

    getMockEvents() {
        const now = new Date();
        const events = [];
        
        // Create some mock events for the next few days
        for (let i = 0; i < 7; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);
            
            if (i === 0) { // Today
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Team Standup',
                    description: 'Daily team synchronization meeting',
                    start: new Date(eventDate.setHours(9, 0)).toISOString(),
                    end: new Date(eventDate.setHours(9, 30)).toISOString(),
                    location: 'Conference Room A',
                    status: 'confirmed'
                });
                
                events.push({
                    id: `mock-${i}-2`,
                    title: 'Project Review',
                    description: 'Review progress on dashboard project',
                    start: new Date(eventDate.setHours(14, 0)).toISOString(),
                    end: new Date(eventDate.setHours(15, 0)).toISOString(),
                    location: 'Online',
                    status: 'confirmed'
                });
            } else if (i === 1) { // Tomorrow
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Client Meeting',
                    description: 'Discuss project requirements and timeline',
                    start: new Date(eventDate.setHours(10, 0)).toISOString(),
                    end: new Date(eventDate.setHours(11, 0)).toISOString(),
                    location: 'Client Office',
                    status: 'confirmed'
                });
            } else if (i === 3) { // Day after tomorrow
                events.push({
                    id: `mock-${i}-1`,
                    title: 'Code Review Session',
                    description: 'Review recent code changes and improvements',
                    start: new Date(eventDate.setHours(16, 0)).toISOString(),
                    end: new Date(eventDate.setHours(17, 0)).toISOString(),
                    location: 'Development Lab',
                    status: 'confirmed'
                });
            }
        }
        
        return events;
    }

    groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toDateString();
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(event);
        });
        
        return grouped;
    }

    formatEventTime(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const startTime = startDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const endTime = endDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `${startTime} - ${endTime}`;
    }
}

module.exports = new GoogleCalendarService();
