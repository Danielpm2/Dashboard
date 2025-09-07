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
            console.log('Initializing Google Calendar OAuth2...');
            
            // Initialize OAuth2 client
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'http://localhost:3000/api/auth/google/callback' // Redirect URI
            );

            // Set up calendar with OAuth2
            this.calendar = google.calendar({ 
                version: 'v3', 
                auth: this.oauth2Client
            });

            // Load stored credentials on startup
            this.loadStoredCredentials();

        } catch (error) {
            console.error('Failed to initialize Google Calendar auth:', error);
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
            
            console.log('Google Calendar credentials set and saved successfully');
            return tokens;
        } catch (error) {
            console.error('Error setting credentials:', error);
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
            console.log('Credentials saved to file successfully');
        } catch (error) {
            console.error('Error saving credentials to file:', error);
        }
    }

    // Load existing credentials from file
    loadStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                const credentialsData = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
                
                // Check if credentials are valid
                if (credentialsData.refresh_token) {
                    this.oauth2Client.setCredentials({
                        access_token: credentialsData.access_token,
                        refresh_token: credentialsData.refresh_token,
                        scope: credentialsData.scope,
                        token_type: credentialsData.token_type,
                        expiry_date: credentialsData.expiry_date
                    });
                    console.log('Stored Google Calendar credentials loaded successfully');
                    return true;
                }
            }
            console.log('No stored credentials found');
            return false;
        } catch (error) {
            console.error('Error loading stored credentials:', error);
            return false;
        }
    }

    // Clear stored credentials
    clearStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                fs.unlinkSync(this.credentialsPath);
                console.log('Stored credentials cleared');
            }
            this.oauth2Client.setCredentials({});
        } catch (error) {
            console.error('Error clearing stored credentials:', error);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.oauth2Client && this.oauth2Client.credentials && 
               (this.oauth2Client.credentials.access_token || this.oauth2Client.credentials.refresh_token);
    }

    async getCalendarEvents(calendarId = 'primary', maxResults = 10) {
        try {
            // Check if user is authenticated
            if (!this.isAuthenticated()) {
                console.log('User not authenticated, using mock data');
                return this.getMockEvents();
            }

            if (!this.calendar) {
                throw new Error('Google Calendar not initialized');
            }

            const now = new Date();
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today to include all-day events
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30); // Next 30 days

            console.log('Fetching real Google Calendar events...');
            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: startDate.toISOString(), // Start from beginning of today
                timeMax: endDate.toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items || [];
            console.log(`Found ${events.length} real calendar events`);
            
            return events.map(event => ({
                id: event.id,
                summary: event.summary || 'Sans titre', // Use summary instead of title
                title: event.summary || 'Sans titre', // Keep both for compatibility
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
            console.log('Falling back to mock data');
            return this.getMockEvents();
        }
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

    // Get a single event
    async getEvent(eventId) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

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

            console.log('Event deleted:', eventId);
            return { success: true, id: eventId };

        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
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
        try {
            // Check if it's an all-day event (no 'T' in the date string)
            const isAllDay = !start.includes('T');
            
            if (isAllDay) {
                const startDate = new Date(start + 'T00:00:00');
                return startDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });
            }
            
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            // Check if dates are valid
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return 'Date invalide';
            }
            
            const startTime = startDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const endTime = endDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `${startTime} - ${endTime}`;
        } catch (error) {
            console.error('Error formatting event time:', error);
            return 'Heure non disponible';
        }
    }
}

module.exports = new GoogleCalendarService();
