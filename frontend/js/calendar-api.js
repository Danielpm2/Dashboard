/**
 * Calendar API Client
 * Handles communication with the Google Calendar backend API
 */

class CalendarAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.calendarEndpoint = `${this.baseURL}/calendar`;
        this.authEndpoint = `${this.baseURL}/auth`;
    }

    // Helper method to handle API requests
    async makeRequest(url, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(url, { ...defaultOptions, ...options });

            // Check if response is ok first
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    // If we can't parse JSON, use the status text
                    console.log('Could not parse error response as JSON');
                }
                throw new Error(errorMessage);
            }

            // Try to parse JSON
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async getAuthStatus() {
        return this.makeRequest(`${this.authEndpoint}/status`);
    }

    async logout() {
        return this.makeRequest(`${this.authEndpoint}/logout`, {
            method: 'POST'
        });
    }

    getAuthUrl() {
        return `${this.authEndpoint}/google`;
    }

    // Calendar event methods
    async getEvents(options = {}) {
        const params = new URLSearchParams();
        
        if (options.maxResults) params.append('maxResults', options.maxResults);
        if (options.timeMin) params.append('timeMin', options.timeMin);
        if (options.timeMax) params.append('timeMax', options.timeMax);
        if (options.grouped) params.append('grouped', 'true');
        if (options.calendars && Array.isArray(options.calendars)) {
            params.append('calendars', JSON.stringify(options.calendars));
        }

        const url = `${this.calendarEndpoint}/events${params.toString() ? '?' + params.toString() : ''}`;
        return this.makeRequest(url);
    }

    async getTodaysEvents() {
        return this.makeRequest(`${this.calendarEndpoint}/events/today`);
    }

    async getUpcomingEvents() {
        return this.makeRequest(`${this.calendarEndpoint}/events/upcoming`);
    }

    async getEventsGroupedByDate(options = {}) {
        return this.getEvents({ ...options, grouped: true });
    }

    async getEvent(eventId) {
        return this.makeRequest(`${this.calendarEndpoint}/events/${eventId}`);
    }

    async createEvent(eventData) {
        return this.makeRequest(`${this.calendarEndpoint}/events`, {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(eventId, eventData) {
        return this.makeRequest(`${this.calendarEndpoint}/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(eventId) {
        return this.makeRequest(`${this.calendarEndpoint}/events/${eventId}`, {
            method: 'DELETE'
        });
    }

    async getCalendars() {
        return this.makeRequest(`${this.calendarEndpoint}/calendars`);
    }

    async updateCalendarSettings(selectedCalendars) {
        return this.makeRequest(`${this.calendarEndpoint}/calendars/settings`, {
            method: 'PUT',
            body: JSON.stringify({ selectedCalendars })
        });
    }

    async testConnection() {
        return this.makeRequest(`${this.calendarEndpoint}/test`);
    }

    // Helper methods for date formatting
    formatDateForAPI(date) {
        if (date instanceof Date) {
            return date.toISOString();
        }
        return new Date(date).toISOString();
    }

    formatDateOnly(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return new Date(date).toISOString().split('T')[0];
    }

    // Create event data structure
    createEventData({
        title,
        description = '',
        location = '',
        startDateTime,
        endDateTime,
        isAllDay = false,
        timeZone = 'America/New_York',
        colorId = '9'
    }) {
        const eventData = {
            summary: title,
            description,
            location,
            timeZone,
            colorId
        };

        if (isAllDay) {
            eventData.isAllDay = true;
            eventData.startDate = this.formatDateOnly(startDateTime);
            eventData.endDate = this.formatDateOnly(endDateTime);
        } else {
            eventData.isAllDay = false;
            eventData.start = this.formatDateForAPI(startDateTime);
            eventData.end = this.formatDateForAPI(endDateTime);
        }

        return eventData;
    }

    // Format event for display
    formatEventForDisplay(event) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const now = new Date();

        return {
            ...event,
            formattedDate: startDate.toLocaleDateString(),
            formattedTime: event.isAllDay ? 'All Day' : `${startDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })} - ${endDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}`,
            isToday: this.isToday(startDate),
            isTomorrow: this.isTomorrow(startDate),
            isOngoing: now >= startDate && now <= endDate,
            isPast: endDate < now,
            isFuture: startDate > now
        };
    }

    // Date helper methods
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    // Get date ranges
    getDateRange(days = 7) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        
        const end = new Date();
        end.setDate(start.getDate() + days);
        end.setHours(23, 59, 59, 999);

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    }

    // HTML escape for security
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
window.CalendarAPI = CalendarAPI;
