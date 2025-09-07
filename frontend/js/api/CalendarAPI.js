/**
 * Calendar API Service
 * Handles all HTTP requests to the calendar backend
 */

class CalendarAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.endpoints = {
            events: '/calendar/events',
            formattedEvents: '/calendar/events/formatted'
        };
    }

    /**
     * Get all calendar events (formatted for display)
     */
    async getEvents() {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.formattedEvents}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API: Error fetching events:', error);
            throw error;
        }
    }

    /**
     * Get a single event by ID
     */
    async getEvent(eventId) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.events}/${eventId}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API: Error fetching event ${eventId}:`, error);
            throw error;
        }
    }

    /**
     * Create a new event
     */
    async createEvent(eventData) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.events}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API: Error creating event:', error);
            throw error;
        }
    }

    /**
     * Update an existing event
     */
    async updateEvent(eventId, eventData) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.events}/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API: Error updating event ${eventId}:`, error);
            throw error;
        }
    }

    /**
     * Delete an event
     */
    async deleteEvent(eventId) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.events}/${eventId}`, {
                method: 'DELETE'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API: Error deleting event ${eventId}:`, error);
            throw error;
        }
    }

    /**
     * Handle HTTP response and parse JSON
     */
    async handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }

    /**
     * Check if API is reachable
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('API: Health check failed:', error);
            return false;
        }
    }
}

export default CalendarAPI;
