/**
 * Visual Calendar Component
 * Manages the FullCalendar.js instance and calendar visualization
 */

class VisualCalendar {
    constructor(containerId) {
        this.containerId = containerId;
        this.calendar = null;
        this.events = [];
        this.onEventClick = null;
        this.onDateSelect = null;
        this.onEventDrop = null;
    }

    /**
     * Initialize the calendar
     */
    init() {
        const calendarEl = document.getElementById(this.containerId);
        if (!calendarEl) {
            throw new Error(`Calendar container ${this.containerId} not found`);
        }

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            height: 'auto',
            events: this.events,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            weekends: true,
            editable: true,
            droppable: true,
            
            // Event handlers
            eventClick: (info) => {
                if (this.onEventClick) {
                    this.onEventClick(info.event);
                }
            },
            
            select: (selectionInfo) => {
                if (this.onDateSelect) {
                    this.onDateSelect(selectionInfo);
                }
            },
            
            eventDrop: (info) => {
                if (this.onEventDrop) {
                    this.onEventDrop(info);
                }
            },
            
            eventResize: (info) => {
                if (this.onEventDrop) {
                    this.onEventDrop(info);
                }
            }
        });

        this.calendar.render();
    }

    /**
     * Set events data
     */
    setEvents(events) {
        this.events = this.formatEventsForCalendar(events);
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.events);
        }
    }

    /**
     * Add a single event
     */
    addEvent(event) {
        const formattedEvent = this.formatEventForCalendar(event);
        this.events.push(formattedEvent);
        if (this.calendar) {
            this.calendar.addEvent(formattedEvent);
        }
    }

    /**
     * Update an existing event
     */
    updateEvent(eventId, eventData) {
        if (!this.calendar) return;

        const calendarEvent = this.calendar.getEventById(eventId);
        if (calendarEvent) {
            const formattedEvent = this.formatEventForCalendar(eventData);
            calendarEvent.setProp('title', formattedEvent.title);
            calendarEvent.setStart(formattedEvent.start);
            calendarEvent.setEnd(formattedEvent.end);
            calendarEvent.setExtendedProp('description', formattedEvent.extendedProps.description);
            calendarEvent.setExtendedProp('location', formattedEvent.extendedProps.location);
        }
    }

    /**
     * Remove an event
     */
    removeEvent(eventId) {
        if (!this.calendar) return;

        const calendarEvent = this.calendar.getEventById(eventId);
        if (calendarEvent) {
            calendarEvent.remove();
        }

        // Remove from local events array
        this.events = this.events.filter(event => event.id !== eventId);
    }

    /**
     * Refresh calendar view
     */
    refresh() {
        if (this.calendar) {
            this.calendar.refetchEvents();
        }
    }

    /**
     * Navigate to specific date
     */
    gotoDate(date) {
        if (this.calendar) {
            this.calendar.gotoDate(date);
        }
    }

    /**
     * Change calendar view
     */
    changeView(viewName) {
        if (this.calendar) {
            this.calendar.changeView(viewName);
        }
    }

    /**
     * Format events for FullCalendar
     */
    formatEventsForCalendar(events) {
        return events.map(event => this.formatEventForCalendar(event));
    }

    /**
     * Format single event for FullCalendar
     */
    formatEventForCalendar(event) {
        const startDateTime = this.combineDateTime(event.date, event.startTime);
        const endDateTime = this.combineDateTime(event.date, event.endTime);

        return {
            id: event.id,
            title: event.title,
            start: startDateTime,
            end: endDateTime,
            extendedProps: {
                description: event.description,
                location: event.location,
                originalEvent: event
            }
        };
    }

    /**
     * Combine date and time strings
     */
    combineDateTime(date, time) {
        if (!date || !time) return date;
        return `${date}T${time}`;
    }

    /**
     * Set event click handler
     */
    setOnEventClick(callback) {
        this.onEventClick = callback;
    }

    /**
     * Set date select handler
     */
    setOnDateSelect(callback) {
        this.onDateSelect = callback;
    }

    /**
     * Set event drop handler
     */
    setOnEventDrop(callback) {
        this.onEventDrop = callback;
    }

    /**
     * Get current calendar date
     */
    getCurrentDate() {
        return this.calendar ? this.calendar.getDate() : new Date();
    }

    /**
     * Get current view name
     */
    getCurrentView() {
        return this.calendar ? this.calendar.view.type : null;
    }

    /**
     * Destroy calendar instance
     */
    destroy() {
        if (this.calendar) {
            this.calendar.destroy();
            this.calendar = null;
        }
        this.events = [];
    }
}

export default VisualCalendar;
