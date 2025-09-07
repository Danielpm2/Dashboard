/**
 * Unified Calendar Manager
 * Handles all calendar operations, event management, and UI coordination
 */

import CalendarAPI from './api/CalendarAPI.js';
import EventModal from './ui/EventModal.js';
import NotificationManager from './ui/NotificationManager.js';
import VisualCalendar from './ui/VisualCalendar.js';

class CalendarManager {
    constructor() {
        this.api = new CalendarAPI();
        this.modal = new EventModal();
        this.visualCalendar = new VisualCalendar();
        this.events = [];
        
        this.init();
    }

    async init() {
        console.log('Initializing Calendar Manager...');
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupEventDelegation();
        
        // Initialize components
        await this.modal.init();
        await this.visualCalendar.init();
        
        // Load initial events
        await this.loadEvents();
        
        console.log('Calendar Manager initialized successfully');
    }

    setupEventListeners() {
        // Add event button
        const addBtn = document.getElementById('add-event-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.createEvent());
        }

        // Refresh button
        const refreshBtn = document.getElementById('calendar-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadEvents());
        }

        // Event form submission
        const form = document.getElementById('event-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupEventDelegation() {
        // Use event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-event-btn');
            const deleteBtn = e.target.closest('.delete-event-btn');
            const eventItem = e.target.closest('.event-item');

            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const eventId = editBtn.dataset.eventId;
                if (eventId) this.editEvent(eventId);
                return;
            }

            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const eventId = deleteBtn.dataset.eventId;
                if (eventId) this.deleteEvent(eventId);
                return;
            }

            // Quick edit on event click (excluding action buttons)
            if (eventItem && !e.target.closest('.event-actions')) {
                const eventId = eventItem.dataset.eventId;
                if (eventId) this.editEvent(eventId);
            }
        });
    }

    async loadEvents() {
        try {
            this.showLoading(true);
            
            const response = await this.api.getEvents();
            
            if (response.success) {
                this.events = response.events || [];
                this.updateViews();
                console.log(`Loaded ${this.events.length} events`);
            } else {
                NotificationManager.error('Failed to load calendar events');
                console.error('Load events error:', response.error);
            }
        } catch (error) {
            NotificationManager.error('Connection error while loading events');
            console.error('Load events network error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    updateViews() {
        // Update event list in dashboard
        if (window.dashboard && typeof window.dashboard.displayCalendarEvents === 'function') {
            window.dashboard.displayCalendarEvents(this.events);
        }
        
        // Update visual calendar
        this.visualCalendar.updateEvents(this.events);
    }

    showLoading(show) {
        const loadingElement = document.getElementById('calendar-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    async createEvent() {
        this.modal.show();
    }

    async editEvent(eventId) {
        try {
            const response = await this.api.getEvent(eventId);
            
            if (response.success) {
                this.modal.show(response.event);
            } else {
                NotificationManager.error('Failed to load event details');
            }
        } catch (error) {
            NotificationManager.error('Connection error while loading event');
            console.error('Edit event error:', error);
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            const response = await this.api.deleteEvent(eventId);
            
            if (response.success) {
                NotificationManager.success('Event deleted successfully');
                await this.loadEvents(); // Refresh views
            } else {
                NotificationManager.error('Failed to delete event');
            }
        } catch (error) {
            NotificationManager.error('Connection error while deleting event');
            console.error('Delete event error:', error);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const eventId = form.dataset.eventId;
        
        try {
            const eventData = this.modal.getFormData();
            let response;
            
            if (mode === 'edit' && eventId) {
                response = await this.api.updateEvent(eventId, eventData);
            } else {
                response = await this.api.createEvent(eventData);
            }
            
            if (response.success) {
                const action = mode === 'edit' ? 'updated' : 'created';
                NotificationManager.success(`Event ${action} successfully`);
                this.modal.hide();
                await this.loadEvents(); // Refresh views
            } else {
                NotificationManager.error(response.error || 'Failed to save event');
            }
        } catch (error) {
            NotificationManager.error('Connection error while saving event');
            console.error('Form submit error:', error);
        }
    }

    // Public API for other components
    getEvents() {
        return this.events;
    }

    async refresh() {
        return this.loadEvents();
    }
}

export default CalendarManager;
