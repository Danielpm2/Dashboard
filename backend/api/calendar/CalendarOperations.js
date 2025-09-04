const { google } = require('googleapis');

class CalendarOperations {
    constructor(oauth2Client) {
        this.oauth2Client = oauth2Client;
        this.calendar = google.calendar({ 
            version: 'v3', 
            auth: oauth2Client
        });
    }

    async getEvents(calendarId = 'primary', maxResults = 10) {
        try {
            const now = new Date();
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30);

            console.log('Fetching real Google Calendar events...');
            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items || [];
            console.log(`Found ${events.length} real calendar events`);
            
            return events.map(event => ({
                id: event.id,
                summary: event.summary || 'Sans titre',
                title: event.summary || 'Sans titre',
                description: event.description || '',
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                location: event.location || '',
                htmlLink: event.htmlLink,
                status: event.status,
                created: event.created,
                updated: event.updated
            }));

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    async createEvent(eventData) {
        try {
            const event = {
                summary: eventData.summary || eventData.title,
                description: eventData.description || '',
                location: eventData.location || ''
            };

            if (eventData.start) {
                event.start = eventData.start;
            }
            if (eventData.end) {
                event.end = eventData.end;
            }

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            console.log('Event created:', response.data.id);
            return response.data;

        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async getEvent(eventId) {
        try {
            const response = await this.calendar.events.get({
                calendarId: 'primary',
                eventId: eventId,
            });

            return response.data;

        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }

    async updateEvent(eventId, eventData) {
        try {
            const event = {
                summary: eventData.summary || eventData.title,
                description: eventData.description || '',
                location: eventData.location || ''
            };

            if (eventData.start) {
                event.start = eventData.start;
            }
            if (eventData.end) {
                event.end = eventData.end;
            }

            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
            });

            console.log('Event updated:', response.data.id);
            return response.data;

        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });

            console.log('Event deleted:', eventId);
            return { success: true, id: eventId };

        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
}

module.exports = CalendarOperations;
