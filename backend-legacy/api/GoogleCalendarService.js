const OAuth2Manager = require('./auth/OAuth2Manager');
const CalendarOperations = require('./calendar/CalendarOperations');
const CalendarUtils = require('./calendar/CalendarUtils');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.oauth2Manager = new OAuth2Manager();
        this.calendarOps = null;
        this.initializeCalendarOperations();
    }

    initializeCalendarOperations() {
        const oauth2Client = this.oauth2Manager.getOAuth2Client();
        if (oauth2Client) {
            this.calendarOps = new CalendarOperations(oauth2Client);
        }
    }

    // Auth methods - delegate to OAuth2Manager
    getAuthUrl() {
        return this.oauth2Manager.getAuthUrl();
    }

    async setCredentials(code) {
        const result = await this.oauth2Manager.setCredentials(code);
        this.initializeCalendarOperations(); // Reinitialize calendar ops with new credentials
        return result;
    }

    loadStoredCredentials() {
        const result = this.oauth2Manager.loadStoredCredentials();
        this.initializeCalendarOperations(); // Reinitialize calendar ops with loaded credentials
        return result;
    }

    clearStoredCredentials() {
        this.oauth2Manager.clearStoredCredentials();
        this.calendarOps = null;
    }

    isAuthenticated() {
        return this.oauth2Manager.isAuthenticated();
    }

    // Calendar operations - delegate to CalendarOperations or use mock data
    async getCalendarEvents(calendarId = 'primary', maxResults = 10) {
        try {
            if (!this.isAuthenticated()) {
                console.log('User not authenticated, using mock data');
                return CalendarUtils.getMockEvents();
            }

            if (!this.calendarOps) {
                this.initializeCalendarOperations();
            }

            return await this.calendarOps.getEvents(calendarId, maxResults);

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            console.log('Falling back to mock data');
            return CalendarUtils.getMockEvents();
        }
    }

    async createEvent(eventData) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        if (!this.calendarOps) {
            this.initializeCalendarOperations();
        }

        return await this.calendarOps.createEvent(eventData);
    }

    async getEvent(eventId) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        if (!this.calendarOps) {
            this.initializeCalendarOperations();
        }

        return await this.calendarOps.getEvent(eventId);
    }

    async updateEvent(eventId, eventData) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        if (!this.calendarOps) {
            this.initializeCalendarOperations();
        }

        return await this.calendarOps.updateEvent(eventId, eventData);
    }

    async deleteEvent(eventId) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        if (!this.calendarOps) {
            this.initializeCalendarOperations();
        }

        return await this.calendarOps.deleteEvent(eventId);
    }

    // Utility methods - delegate to CalendarUtils
    groupEventsByDate(events) {
        return CalendarUtils.groupEventsByDate(events);
    }

    formatEventTime(start, end) {
        return CalendarUtils.formatEventTime(start, end);
    }

    getMockEvents() {
        return CalendarUtils.getMockEvents();
    }
}

module.exports = new GoogleCalendarService();
