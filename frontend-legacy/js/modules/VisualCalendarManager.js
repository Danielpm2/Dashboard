/**
 * Visual Calendar Manager using FullCalendar.js
 * Manages the visual calendar interface and integrates with Google Calendar data
 */

class VisualCalendarManager {
    constructor() {
        this.calendar = null;
        this.isInitialized = false;
        this.events = [];
        this.colors = [
            '#00d563', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', 
            '#8b5cf6', '#f97316', '#84cc16', '#ec4899', '#6366f1'
        ];
        
        this.initializeEventListeners();
        
        // Auto-initialize calendar view on load
        setTimeout(() => {
            this.initializeCalendar();
        }, 500);
    }

    /**
     * Initialize event listeners for calendar interactions
     */
    initializeEventListeners() {
        // Listen for calendar events updates
        document.addEventListener('calendar-events-updated', (event) => {
            this.updateEvents(event.detail.events);
        });
    }

    /**
     * Initialize FullCalendar
     */
    async initializeCalendar() {
        if (this.isInitialized) return;

        const calendarEl = document.getElementById('visual-calendar');
        if (!calendarEl) {
            console.error('Visual calendar element not found');
            return;
        }

        try {
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                height: 'auto',
                events: [],
                eventClick: this.handleEventClick.bind(this),
                dateClick: this.handleDateClick.bind(this),
                eventDidMount: this.handleEventDidMount.bind(this),
                dayMaxEvents: 3,
                moreLinkClick: 'popover',
                nowIndicator: true,
                selectable: true,
                selectMirror: true,
                dayHeaders: true,
                weekNumbers: false,
                navLinks: true,
                editable: false,
                droppable: false,
                firstDay: 1, // Monday
                locale: 'en',
                buttonText: {
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day'
                },
                eventDisplay: 'block',
                displayEventTime: true,
                displayEventEnd: false,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }
            });

            this.calendar.render();
            this.isInitialized = true;
            console.log('FullCalendar initialized successfully');

        } catch (error) {
            console.error('Error initializing FullCalendar:', error);
        }
    }

    /**
     * Update events from Google Calendar
     */
    updateEvents(events) {
        this.events = events || [];
        if (this.isInitialized && this.calendar) {
            this.refreshCalendarEvents();
        }
    }

    /**
     * Convert Google Calendar events to FullCalendar format
     */
    convertEventsToFullCalendarFormat(events) {
        return events.map((event, index) => {
            const colorIndex = index % this.colors.length;
            const backgroundColor = this.colors[colorIndex];
            
            // Parse date and time
            let start, end;
            
            if (event.start?.dateTime) {
                start = new Date(event.start.dateTime);
            } else if (event.start?.date) {
                start = new Date(event.start.date);
            }
            
            if (event.end?.dateTime) {
                end = new Date(event.end.dateTime);
            } else if (event.end?.date) {
                end = new Date(event.end.date);
            }

            return {
                id: event.id,
                title: event.summary || 'No Title',
                start: start,
                end: end,
                allDay: !event.start?.dateTime, // All-day if no time specified
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: '#ffffff',
                extendedProps: {
                    description: event.description || '',
                    location: event.location || '',
                    organizer: event.organizer?.email || '',
                    status: event.status || '',
                    htmlLink: event.htmlLink || '',
                    originalEvent: event
                }
            };
        });
    }

    /**
     * Refresh calendar events
     */
    refreshCalendarEvents() {
        if (!this.calendar) return;

        const formattedEvents = this.convertEventsToFullCalendarFormat(this.events);
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(formattedEvents);
    }

    /**
     * Handle event click
     */
    handleEventClick(info) {
        const event = info.event;
        const props = event.extendedProps;

        // Create event details modal or tooltip
        this.showEventDetails({
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            description: props.description,
            location: props.location,
            organizer: props.organizer,
            htmlLink: props.htmlLink
        });
    }

    /**
     * Handle date click
     */
    handleDateClick(info) {
        // Could be used to add new events on date click
        console.log('Date clicked:', info.dateStr);
        
        // Optionally trigger add event modal for this date
        const addEventBtn = document.getElementById('add-event-btn');
        if (addEventBtn) {
            // You could pre-fill the date in the add event form
            addEventBtn.click();
        }
    }

    /**
     * Handle event did mount (for custom styling)
     */
    handleEventDidMount(info) {
        const event = info.event;
        const element = info.el;
        
        // Add custom classes based on event properties
        if (event.extendedProps.status === 'cancelled') {
            element.classList.add('event-cancelled');
        }
        
        // Add tooltip with event details
        element.title = this.createEventTooltip(event);
    }

    /**
     * Create event tooltip text
     */
    createEventTooltip(event) {
        const props = event.extendedProps;
        let tooltip = event.title;
        
        if (event.start) {
            const startTime = event.start.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            tooltip += `\nTime: ${startTime}`;
        }
        
        if (props.location) {
            tooltip += `\nLocation: ${props.location}`;
        }
        
        if (props.description) {
            const shortDesc = props.description.length > 100 
                ? props.description.substring(0, 100) + '...' 
                : props.description;
            tooltip += `\nDescription: ${shortDesc}`;
        }
        
        return tooltip;
    }

    /**
     * Show event details in a modal or popup
     */
    showEventDetails(eventData) {
        // Create a simple modal for event details
        const modal = document.createElement('div');
        modal.className = 'event-details-modal';
        modal.innerHTML = `
            <div class="event-details-content">
                <div class="event-details-header">
                    <h3>${eventData.title}</h3>
                    <button class="close-details-btn">&times;</button>
                </div>
                <div class="event-details-body">
                    <div class="event-detail-item">
                        <strong>Date:</strong> ${eventData.start.toLocaleDateString()}
                    </div>
                    ${eventData.start.getHours() !== 0 || eventData.start.getMinutes() !== 0 ? `
                        <div class="event-detail-item">
                            <strong>Time:</strong> ${eventData.start.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}${eventData.end ? ` - ${eventData.end.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}` : ''}
                        </div>
                    ` : ''}
                    ${eventData.location ? `
                        <div class="event-detail-item">
                            <strong>Location:</strong> ${eventData.location}
                        </div>
                    ` : ''}
                    ${eventData.description ? `
                        <div class="event-detail-item">
                            <strong>Description:</strong> ${eventData.description}
                        </div>
                    ` : ''}
                    ${eventData.organizer ? `
                        <div class="event-detail-item">
                            <strong>Organizer:</strong> ${eventData.organizer}
                        </div>
                    ` : ''}
                    ${eventData.htmlLink ? `
                        <div class="event-detail-item">
                            <a href="${eventData.htmlLink}" target="_blank" class="event-link">
                                Open in Google Calendar
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Add styles for modal content
        const style = document.createElement('style');
        style.textContent = `
            .event-details-content {
                background: #1a1a1a;
                border-radius: 16px;
                border: 1px solid #2a2a2a;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .event-details-header {
                padding: 1.5rem;
                border-bottom: 1px solid #2a2a2a;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .event-details-header h3 {
                color: #ffffff;
                margin: 0;
                font-size: 1.3rem;
            }
            .close-details-btn {
                background: none;
                border: none;
                color: #b3b3b3;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                width: 2rem;
                height: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .close-details-btn:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.1);
            }
            .event-details-body {
                padding: 1.5rem;
            }
            .event-detail-item {
                margin-bottom: 1rem;
                color: #b3b3b3;
                line-height: 1.5;
            }
            .event-detail-item strong {
                color: #ffffff;
                display: inline-block;
                min-width: 100px;
            }
            .event-link {
                color: #00d563;
                text-decoration: none;
                font-weight: 500;
            }
            .event-link:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.close-details-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    /**
     * Get current view
     */
    getCurrentView() {
        return 'calendar'; // Always calendar now
    }

    /**
     * Go to specific date
     */
    goToDate(date) {
        if (this.calendar) {
            this.calendar.gotoDate(date);
        }
    }

    /**
     * Destroy calendar instance
     */
    destroy() {
        if (this.calendar) {
            this.calendar.destroy();
            this.isInitialized = false;
        }
    }
}

// Export for use in other modules
export default VisualCalendarManager;
