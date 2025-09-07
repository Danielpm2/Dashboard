/**
 * Calendar Integration Manager
 * Coordinates between CalendarEventsManager and VisualCalendarManager
 */

import VisualCalendarManager from './modules/VisualCalendarManager.js';

class CalendarIntegration {
    constructor() {
        this.visualCalendar = null;
        this.init();
    }

    async init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('Setting up Calendar Integration...');
        
        // Initialize Visual Calendar Manager
        this.visualCalendar = new VisualCalendarManager();
        
        // Make it globally accessible for debugging
        window.visualCalendarManager = this.visualCalendar;
        
        // Wait a bit for other managers to initialize, then sync
        setTimeout(() => {
            this.syncInitialEvents();
        }, 1000);
        
        console.log('Calendar Integration setup complete');
    }

    async syncInitialEvents() {
        // Get events from CalendarEventsManager if available
        if (window.calendarEventsManager && window.calendarEventsManager.getEvents) {
            const events = window.calendarEventsManager.getEvents();
            if (events && events.length > 0) {
                this.visualCalendar.updateEvents(events);
                console.log('Synced initial events to visual calendar:', events.length);
            }
        }
    }
}

// Initialize the integration
const calendarIntegration = new CalendarIntegration();

export default CalendarIntegration;
