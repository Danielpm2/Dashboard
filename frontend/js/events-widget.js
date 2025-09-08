/**
 * Events List Widget
 * Displays upcoming calendar events in a list format
 */

class EventsWidget {
    constructor(element) {
        this.element = element;
        this.calendarAPI = new CalendarAPI();
        this.events = [];
        this.isAuthenticated = false;
        this.currentEditingEvent = null;
        this.viewMode = 'upcoming'; // 'upcoming', 'today', 'week'
        
        this.init();
    }

    async init() {
        this.setupHTML();
        this.attachEventListeners();
        await this.checkAuthentication();
        if (this.isAuthenticated) {
            await this.loadEvents();
        }
        this.render();
    }

    setupHTML() {
        this.element.innerHTML = `
            <div class="events-widget">
                <div class="events-header">
                    <div class="events-title-section">
                        <h3 class="events-title">Events</h3>
                        <select id="eventsViewMode" class="events-view-select">
                            <option value="upcoming">Upcoming</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                        </select>
                    </div>
                    <div class="events-actions">
                        <button class="events-auth-btn" id="eventsAuthBtn">Sign In</button>
                        <button class="events-refresh-btn" id="eventsRefreshBtn" title="Refresh">⟳</button>
                        <button class="events-add-btn" id="eventsAddBtn" title="Add Event">+</button>
                    </div>
                </div>
                <div class="events-body">
                    <div class="events-list" id="eventsList">
                        <!-- Events will be rendered here -->
                    </div>
                </div>
                <div class="events-footer">
                    <div class="events-status" id="eventsStatus">Loading...</div>
                </div>
            </div>

            <!-- Quick Event Form -->
            <div class="quick-event-form" id="quickEventForm" style="display: none;">
                <div class="quick-form-content">
                    <div class="quick-form-header">
                        <h4 id="quickFormTitle">Quick Add Event</h4>
                        <button class="quick-form-close" id="closeQuickForm">&times;</button>
                    </div>
                    <form id="quickForm">
                        <div class="form-group">
                            <input type="text" id="quickEventTitle" placeholder="Event title" required>
                        </div>
                        <div class="form-row">
                            <input type="date" id="quickEventDate" required>
                            <input type="time" id="quickEventTime">
                            <label>
                                <input type="checkbox" id="quickEventAllDay"> All Day
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Add</button>
                            <button type="button" id="cancelQuickForm" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // View mode selector
        this.element.querySelector('#eventsViewMode').addEventListener('change', (e) => {
            this.viewMode = e.target.value;
            if (this.isAuthenticated) {
                this.loadEvents();
            }
        });

        // Actions
        this.element.querySelector('#eventsAuthBtn').addEventListener('click', () => this.handleAuth());
        this.element.querySelector('#eventsRefreshBtn').addEventListener('click', () => this.refreshEvents());
        this.element.querySelector('#eventsAddBtn').addEventListener('click', () => this.showQuickForm());

        // Quick form
        this.element.querySelector('#closeQuickForm').addEventListener('click', () => this.hideQuickForm());
        this.element.querySelector('#cancelQuickForm').addEventListener('click', () => this.hideQuickForm());
        this.element.querySelector('#quickForm').addEventListener('submit', (e) => this.handleQuickSubmit(e));
        
        // All day checkbox for quick form
        this.element.querySelector('#quickEventAllDay').addEventListener('change', (e) => {
            const timeField = this.element.querySelector('#quickEventTime');
            timeField.disabled = e.target.checked;
            if (e.target.checked) timeField.value = '';
        });

        // Close quick form when clicking outside
        this.element.querySelector('#quickEventForm').addEventListener('click', (e) => {
            if (e.target.id === 'quickEventForm') this.hideQuickForm();
        });
    }

    async checkAuthentication() {
        try {
            const authStatus = await this.calendarAPI.getAuthStatus();
            this.isAuthenticated = authStatus.authenticated;
            this.updateAuthButton();
            this.updateStatus(authStatus.authenticated ? 'Connected to Google Calendar' : 'Not connected');
        } catch (error) {
            console.error('Auth check failed:', error);
            this.isAuthenticated = false;
            this.updateAuthButton();
            this.updateStatus('Connection error');
        }
    }

    updateAuthButton() {
        const authBtn = this.element.querySelector('#eventsAuthBtn');
        if (this.isAuthenticated) {
            authBtn.textContent = 'Sign Out';
            authBtn.classList.add('authenticated');
        } else {
            authBtn.textContent = 'Sign In';
            authBtn.classList.remove('authenticated');
        }
    }

    async handleAuth() {
        if (this.isAuthenticated) {
            try {
                await this.calendarAPI.logout();
                this.isAuthenticated = false;
                this.events = [];
                this.updateAuthButton();
                this.render();
                this.updateStatus('Signed out');
            } catch (error) {
                console.error('Logout failed:', error);
                this.updateStatus('Logout failed');
            }
        } else {
            window.open(this.calendarAPI.getAuthUrl(), '_blank');
            // Check auth status after a delay
            setTimeout(() => this.checkAuthentication(), 2000);
        }
    }

    async loadEvents() {
        if (!this.isAuthenticated) return;

        try {
            this.updateStatus('Loading events...');
            
            let events;
            switch (this.viewMode) {
                case 'today':
                    events = await this.calendarAPI.getTodaysEvents();
                    break;
                case 'week':
                    const weekRange = this.calendarAPI.getDateRange(7);
                    events = await this.calendarAPI.getEvents({
                        timeMin: weekRange.start,
                        timeMax: weekRange.end,
                        maxResults: 50
                    });
                    break;
                case 'upcoming':
                default:
                    events = await this.calendarAPI.getUpcomingEvents();
                    break;
            }

            this.events = (events.events || []).map(event => 
                this.calendarAPI.formatEventForDisplay(event)
            );
            
            this.render();
            this.updateStatus(`Loaded ${this.events.length} events`);
        } catch (error) {
            console.error('Failed to load events:', error);
            this.updateStatus('Failed to load events');
            this.events = [];
            this.render();
        }
    }

    async refreshEvents() {
        await this.checkAuthentication();
        if (this.isAuthenticated) {
            await this.loadEvents();
        }
    }

    render() {
        const eventsList = this.element.querySelector('#eventsList');
        
        if (!this.isAuthenticated) {
            eventsList.innerHTML = `
                <div class="events-empty">
                    <p>Sign in to Google Calendar to view your events</p>
                </div>
            `;
            return;
        }

        if (this.events.length === 0) {
            const viewModeText = this.viewMode === 'today' ? 'today' : 
                                 this.viewMode === 'week' ? 'this week' : 'upcoming';
            eventsList.innerHTML = `
                <div class="events-empty">
                    <p>No events ${viewModeText}</p>
                    <button class="btn-primary" onclick="this.closest('.events-widget').querySelector('#eventsAddBtn').click()">
                        Add Event
                    </button>
                </div>
            `;
            return;
        }

        // Group events by date
        const groupedEvents = this.groupEventsByDate(this.events);
        
        eventsList.innerHTML = Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            const isToday = this.calendarAPI.isToday(date);
            const isTomorrow = this.calendarAPI.isTomorrow(date);
            
            let dateLabel;
            if (isToday) {
                dateLabel = 'Today';
            } else if (isTomorrow) {
                dateLabel = 'Tomorrow';
            } else {
                dateLabel = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }

            return `
                <div class="events-date-group">
                    <div class="events-date-header">
                        <h4 class="events-date-title ${isToday ? 'today' : ''}">${dateLabel}</h4>
                        <span class="events-count">${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="events-date-list">
                        ${dayEvents.map(event => this.renderEvent(event)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners to rendered events
        this.attachEventEventListeners();
    }

    renderEvent(event) {
        const statusClass = event.isPast ? 'past' : 
                           event.isOngoing ? 'ongoing' : 
                           event.isFuture ? 'future' : '';

        return `
            <div class="event-item ${statusClass}" data-event-id="${event.id}" 
                 style="border-left: 4px solid ${event.color?.background || '#5484ed'};">
                <div class="event-time" style="background-color: ${event.color?.background || '#5484ed'}; color: ${event.color?.foreground || '#ffffff'};">
                    ${event.formattedTime}
                    ${event.isOngoing ? '<span class="event-status-badge ongoing">Now</span>' : ''}
                </div>
                <div class="event-details">
                    <div class="event-title">${CalendarAPI.escapeHtml(event.summary)}</div>
                    ${event.location ? `<div class="event-location">📍 ${CalendarAPI.escapeHtml(event.location)}</div>` : ''}
                    ${event.description ? `<div class="event-description">${CalendarAPI.escapeHtml(event.description.substring(0, 100))}${event.description.length > 100 ? '...' : ''}</div>` : ''}
                </div>
                <div class="event-actions">
                    <button class="event-edit-btn" data-event-id="${event.id}" title="Edit">✏️</button>
                    <button class="event-delete-btn" data-event-id="${event.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }

    attachEventEventListeners() {
        // Edit buttons
        this.element.querySelectorAll('.event-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                const event = this.events.find(e => e.id === eventId);
                if (event) this.editEvent(event);
            });
        });

        // Delete buttons
        this.element.querySelectorAll('.event-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                if (confirm('Are you sure you want to delete this event?')) {
                    await this.deleteEvent(eventId);
                }
            });
        });

        // Event items (click to view/edit)
        this.element.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', () => {
                const eventId = item.dataset.eventId;
                const event = this.events.find(e => e.id === eventId);
                if (event) this.editEvent(event);
            });
        });
    }

    groupEventsByDate(events) {
        return events.reduce((groups, event) => {
            const date = new Date(event.start);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
            
            return groups;
        }, {});
    }

    showQuickForm(event = null) {
        const form = this.element.querySelector('#quickEventForm');
        const quickForm = this.element.querySelector('#quickForm');
        const titleElement = this.element.querySelector('#quickFormTitle');

        // Reset form
        quickForm.reset();
        
        if (event) {
            // Edit mode
            titleElement.textContent = 'Edit Event';
            this.element.querySelector('#quickEventTitle').value = event.summary || '';
            
            if (event.isAllDay) {
                this.element.querySelector('#quickEventAllDay').checked = true;
                this.element.querySelector('#quickEventDate').value = event.startDate;
                this.element.querySelector('#quickEventTime').disabled = true;
            } else {
                const startDate = new Date(event.start);
                this.element.querySelector('#quickEventDate').value = startDate.toISOString().split('T')[0];
                this.element.querySelector('#quickEventTime').value = startDate.toTimeString().slice(0, 5);
            }
            
            quickForm.dataset.eventId = event.id;
            this.currentEditingEvent = event;
        } else {
            // Add mode
            titleElement.textContent = 'Quick Add Event';
            delete quickForm.dataset.eventId;
            this.currentEditingEvent = null;
            
            // Pre-fill with today's date
            const today = new Date().toISOString().split('T')[0];
            this.element.querySelector('#quickEventDate').value = today;
        }

        form.style.display = 'flex';
    }

    hideQuickForm() {
        this.element.querySelector('#quickEventForm').style.display = 'none';
        this.currentEditingEvent = null;
    }

    async handleQuickSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const isEdit = !!form.dataset.eventId;
        
        try {
            const isAllDay = this.element.querySelector('#quickEventAllDay').checked;
            const date = this.element.querySelector('#quickEventDate').value;
            const time = this.element.querySelector('#quickEventTime').value;
            
            let startDateTime, endDateTime;
            
            if (isAllDay) {
                startDateTime = date;
                endDateTime = date;
            } else {
                const timeToUse = time || '09:00';
                startDateTime = `${date}T${timeToUse}`;
                
                // Default to 1 hour duration
                const endDate = new Date(`${date}T${timeToUse}`);
                endDate.setHours(endDate.getHours() + 1);
                endDateTime = endDate.toISOString().slice(0, 16);
            }

            const eventData = this.calendarAPI.createEventData({
                title: this.element.querySelector('#quickEventTitle').value,
                startDateTime,
                endDateTime,
                isAllDay
            });

            if (isEdit) {
                await this.calendarAPI.updateEvent(form.dataset.eventId, eventData);
                this.updateStatus('Event updated');
            } else {
                await this.calendarAPI.createEvent(eventData);
                this.updateStatus('Event created');
            }

            this.hideQuickForm();
            await this.loadEvents();
        } catch (error) {
            console.error('Failed to save event:', error);
            this.updateStatus('Failed to save event');
        }
    }

    async editEvent(event) {
        this.showQuickForm(event);
    }

    async deleteEvent(eventId) {
        try {
            await this.calendarAPI.deleteEvent(eventId);
            await this.loadEvents();
            this.updateStatus('Event deleted');
        } catch (error) {
            console.error('Failed to delete event:', error);
            this.updateStatus('Failed to delete event');
        }
    }

    updateStatus(message) {
        this.element.querySelector('#eventsStatus').textContent = message;
    }
}

// Export for use in dashboard
window.EventsWidget = EventsWidget;
