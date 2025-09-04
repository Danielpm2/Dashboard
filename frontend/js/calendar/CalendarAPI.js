// Calendar API service for CRUD operations
class CalendarAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async loadEvents() {
        try {
            const response = await fetch(`${this.baseUrl}/calendar/events/formatted`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur réseau:', error);
            throw error;
        }
    }

    async createEvent(eventData) {
        const response = await fetch(`${this.baseUrl}/calendar/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        
        return await response.json();
    }

    async updateEvent(eventId, eventData) {
        const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        
        return await response.json();
    }

    async getEvent(eventId) {
        const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`);
        return await response.json();
    }

    async deleteEvent(eventId) {
        const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`, {
            method: 'DELETE'
        });
        
        return await response.json();
    }
}

export default CalendarAPI;
