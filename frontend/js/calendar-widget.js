/**
 * Calendar Widget
 * Displays a monthly calendar view with Google Calendar events
 */

class CalendarWidget {
    constructor(element) {
        this.element = element;
        this.calendarAPI = new CalendarAPI();
        this.currentDate = new Date();
        this.events = [];
        this.eventsByDate = {};
        this.selectedDate = null;
        this.isAuthenticated = false;
        this.selectedCalendars = this.loadSelectedCalendarsFromStorage();
        this.calendarSettings = null;
        
        this.init();
    }

    // Load selected calendars from localStorage
    loadSelectedCalendarsFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-selected-calendars');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log('📋 Calendar widget loaded selected calendars from storage:', parsed);
                    return parsed;
                }
            }
        } catch (error) {
            console.error('❌ Error loading selected calendars from storage:', error);
        }
        
        // Default to primary calendar
        return ['primary'];
    }

    async init() {
        this.setupHTML();
        this.attachEventListeners();
        await this.checkAuthentication();
        
        // Initialize calendar settings
        if (typeof CalendarSettings !== 'undefined') {
            this.calendarSettings = new CalendarSettings(this);
        }
        
        if (this.isAuthenticated) {
            await this.loadEvents();
        }
        this.render();
    }

    setupHTML() {
        this.element.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="prevMonth">&lt;</button>
                    <h3 class="calendar-title" id="monthYear">
                        ${this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button class="calendar-nav-btn" id="nextMonth">&gt;</button>
                    <div class="calendar-actions">
                        <button class="calendar-auth-btn" id="authBtn">Sign In</button>
                        <button class="settings-btn" id="settingsBtn" title="Calendar Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="calendar-refresh-btn" id="refreshBtn" title="Refresh Events">⟳</button>
                        <button class="calendar-add-btn" id="addEventBtn" title="Add Event">+</button>
                    </div>
                </div>
                <div class="calendar-body">
                    <div class="calendar-weekdays">
                        <div class="weekday">Sun</div>
                        <div class="weekday">Mon</div>
                        <div class="weekday">Tue</div>
                        <div class="weekday">Wed</div>
                        <div class="weekday">Thu</div>
                        <div class="weekday">Fri</div>
                        <div class="weekday">Sat</div>
                    </div>
                    <div class="calendar-days" id="calendarDays">
                        <!-- Days will be generated here -->
                    </div>
                </div>
                <div class="calendar-footer">
                    <div class="calendar-status" id="calendarStatus">Loading...</div>
                </div>
            </div>
            
            <!-- Event Modal -->
            <div class="event-modal" id="eventModal" style="display: none;">
                <div class="event-modal-content">
                    <div class="event-modal-header">
                        <h4 id="eventModalTitle">Add Event</h4>
                        <button class="event-modal-close" id="closeModal">&times;</button>
                    </div>
                    <div class="event-modal-body">
                        <form id="eventForm">
                            <div class="form-group">
                                <label for="eventTitle">Title:</label>
                                <input type="text" id="eventTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="eventDescription">Description:</label>
                                <textarea id="eventDescription" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="eventLocation">Location:</label>
                                <input type="text" id="eventLocation">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventStartDate">Start Date:</label>
                                    <input type="date" id="eventStartDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="eventStartTime">Start Time:</label>
                                    <input type="time" id="eventStartTime">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventEndDate">End Date:</label>
                                    <input type="date" id="eventEndDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="eventEndTime">End Time:</label>
                                    <input type="time" id="eventEndTime">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="eventAllDay"> All Day Event
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="eventColor">Color:</label>
                                <div class="event-color-picker">
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="1" id="color1">
                                        <label for="color1" class="color-swatch" style="background-color: #a4bdfc;" title="Lavender"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="2" id="color2">
                                        <label for="color2" class="color-swatch" style="background-color: #7ae7bf;" title="Sage"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="3" id="color3">
                                        <label for="color3" class="color-swatch" style="background-color: #dbadff;" title="Grape"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="4" id="color4">
                                        <label for="color4" class="color-swatch" style="background-color: #ff887c;" title="Flamingo"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="5" id="color5">
                                        <label for="color5" class="color-swatch" style="background-color: #fbd75b;" title="Banana"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="6" id="color6">
                                        <label for="color6" class="color-swatch" style="background-color: #ffb878;" title="Tangerine"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="7" id="color7">
                                        <label for="color7" class="color-swatch" style="background-color: #46d6db;" title="Peacock"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="8" id="color8">
                                        <label for="color8" class="color-swatch" style="background-color: #e1e1e1;" title="Graphite"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="9" id="color9" checked>
                                        <label for="color9" class="color-swatch" style="background-color: #5484ed;" title="Blueberry"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="10" id="color10">
                                        <label for="color10" class="color-swatch" style="background-color: #51b749;" title="Basil"></label>
                                    </div>
                                    <div class="color-option">
                                        <input type="radio" name="eventColor" value="11" id="color11">
                                        <label for="color11" class="color-swatch" style="background-color: #dc2127;" title="Tomato"></label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" id="deleteEventBtn" class="btn-danger" style="display: none;">Delete</button>
                                <button type="submit" id="saveEventBtn" class="btn-primary">Save</button>
                                <button type="button" id="cancelEventBtn" class="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Navigation
        this.element.querySelector('#prevMonth').addEventListener('click', () => this.previousMonth());
        this.element.querySelector('#nextMonth').addEventListener('click', () => this.nextMonth());
        
        // Actions
        this.element.querySelector('#authBtn').addEventListener('click', () => this.handleAuth());
        this.element.querySelector('#refreshBtn').addEventListener('click', () => this.refreshEvents());
        this.element.querySelector('#addEventBtn').addEventListener('click', () => this.showEventModal());
        
        // Modal
        this.element.querySelector('#closeModal').addEventListener('click', () => this.hideEventModal());
        this.element.querySelector('#cancelEventBtn').addEventListener('click', () => this.hideEventModal());
        this.element.querySelector('#eventForm').addEventListener('submit', (e) => this.handleEventSubmit(e));
        this.element.querySelector('#deleteEventBtn').addEventListener('click', () => this.handleEventDelete());
        
        // All day checkbox
        this.element.querySelector('#eventAllDay').addEventListener('change', (e) => {
            const timeFields = this.element.querySelectorAll('#eventStartTime, #eventEndTime');
            timeFields.forEach(field => {
                field.disabled = e.target.checked;
                if (e.target.checked) field.value = '';
            });
        });

        // Close modal when clicking outside
        this.element.querySelector('#eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') this.hideEventModal();
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
        const authBtn = this.element.querySelector('#authBtn');
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
                this.eventsByDate = {};
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
            
            // Get a wider date range to include partial weeks from previous/next months
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            
            // Start from first day of calendar grid (might be in previous month)
            const firstDayOfMonth = new Date(year, month, 1);
            const startOfCalendar = new Date(firstDayOfMonth);
            startOfCalendar.setDate(startOfCalendar.getDate() - firstDayOfMonth.getDay());
            
            // End at last day of calendar grid (might be in next month)
            const lastDayOfMonth = new Date(year, month + 1, 0);
            const endOfCalendar = new Date(lastDayOfMonth);
            const remainingDays = 6 - lastDayOfMonth.getDay();
            endOfCalendar.setDate(endOfCalendar.getDate() + remainingDays);
            
            const events = await this.calendarAPI.getEventsGroupedByDate({
                timeMin: startOfCalendar.toISOString(),
                timeMax: endOfCalendar.toISOString(),
                maxResults: 200, // Increase limit to get more events
                calendars: this.selectedCalendars
            });

            this.events = events.events || [];
            this.eventsByDate = events.grouped || {};
            this.render();
            this.updateStatus(`Loaded ${this.events.length} events`);
        } catch (error) {
            console.error('Failed to load events:', error);
            this.updateStatus('Failed to load events');
        }
    }

    async refreshEvents() {
        await this.checkAuthentication();
        if (this.isAuthenticated) {
            await this.loadEvents();
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateMonthDisplay();
        if (this.isAuthenticated) {
            this.loadEvents();
        }
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateMonthDisplay();
        if (this.isAuthenticated) {
            this.loadEvents();
        }
    }

    updateMonthDisplay() {
        this.element.querySelector('#monthYear').textContent = 
            this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    render() {
        const calendarDays = this.element.querySelector('#calendarDays');
        calendarDays.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // First day of month and how many days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.eventsByDate[dateKey] || [];
            

            
            // Check if it's today
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            // Create dynamic content based on number of events
            const eventContent = this.renderDayEvents(dayEvents, day);
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                ${eventContent}
            `;

            // Add event listeners
            dayElement.addEventListener('click', () => this.handleDayClick(year, month, day, dayEvents));
            
            // Add event listeners to individual events
            dayElement.querySelectorAll('.day-event[data-event-id]').forEach(eventEl => {
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const eventId = eventEl.dataset.eventId;
                    const event = this.events.find(e => e.id === eventId);
                    if (event) this.showEventModal(event);
                });
            });

            // Add event listeners to "more events" indicators
            dayElement.querySelectorAll('.day-event-more, .day-event-count').forEach(moreEl => {
                moreEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDayEventsPopup(year, month, day, dayEvents);
                });
            });

            calendarDays.appendChild(dayElement);
        }
    }

    handleDayClick(year, month, day, dayEvents) {
        this.selectedDate = new Date(year, month, day);
        
        if (dayEvents.length === 0) {
            // No events, show add event modal for this date
            this.showEventModal(null, this.selectedDate);
        } else if (dayEvents.length === 1) {
            // One event, show edit modal
            this.showEventModal(dayEvents[0]);
        } else {
            // Multiple events, show day events popup
            this.showDayEventsPopup(year, month, day, dayEvents);
        }
    }

    // Show popup with all events for a specific day
    showDayEventsPopup(year, month, day, dayEvents) {
        const date = new Date(year, month, day);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Create popup HTML
        const popupHTML = `
            <div class="day-events-popup" id="dayEventsPopup">
                <div class="day-events-popup-content">
                    <div class="day-events-popup-header">
                        <h4>Events for ${dateStr}</h4>
                        <div class="day-events-popup-actions">
                            <button class="btn-primary day-add-event-btn" title="Add Event">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="day-events-popup-close" title="Close">&times;</button>
                        </div>
                    </div>
                    <div class="day-events-popup-body">
                        ${dayEvents.map(event => `
                            <div class="day-event-item" data-event-id="${event.id}">
                                <div class="day-event-time" style="background-color: ${event.color?.background || '#5484ed'}; color: ${event.color?.foreground || '#ffffff'};">
                                    ${event.formattedTime || 'All Day'}
                                </div>
                                <div class="day-event-details">
                                    <div class="day-event-title" style="border-left: 4px solid ${event.color?.background || '#5484ed'}; padding-left: 8px;">
                                        ${CalendarAPI.escapeHtml(event.summary)}
                                    </div>
                                    ${event.location ? `<div class="day-event-location">📍 ${CalendarAPI.escapeHtml(event.location)}</div>` : ''}
                                    ${event.description ? `<div class="day-event-description">${CalendarAPI.escapeHtml(event.description.substring(0, 100))}${event.description.length > 100 ? '...' : ''}</div>` : ''}
                                </div>
                                <div class="day-event-actions">
                                    <button class="day-event-edit-btn" data-event-id="${event.id}" title="Edit">✏️</button>
                                    <button class="day-event-delete-btn" data-event-id="${event.id}" title="Delete">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Remove existing popup if any
        const existingPopup = document.querySelector('#dayEventsPopup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Add popup to document
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        const popup = document.querySelector('#dayEventsPopup');

        // Add event listeners
        popup.querySelector('.day-events-popup-close').addEventListener('click', () => {
            popup.remove();
        });

        popup.querySelector('.day-add-event-btn').addEventListener('click', () => {
            popup.remove();
            this.showEventModal(null, this.selectedDate);
        });

        // Edit event buttons
        popup.querySelectorAll('.day-event-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                const event = dayEvents.find(e => e.id === eventId);
                popup.remove();
                this.showEventModal(event);
            });
        });

        // Delete event buttons
        popup.querySelectorAll('.day-event-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                const event = dayEvents.find(e => e.id === eventId);
                if (confirm(`Are you sure you want to delete "${event.summary}"?`)) {
                    try {
                        await this.calendarAPI.deleteEvent(eventId);
                        popup.remove();
                        await this.loadEvents();
                        this.updateStatus('Event deleted');
                    } catch (error) {
                        console.error('Failed to delete event:', error);
                        this.updateStatus('Failed to delete event');
                    }
                }
            });
        });

        // Close when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target.id === 'dayEventsPopup') {
                popup.remove();
            }
        });

        // Close with Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    showEventModal(event = null, presetDate = null) {
        const modal = this.element.querySelector('#eventModal');
        const form = this.element.querySelector('#eventForm');
        const titleElement = this.element.querySelector('#eventModalTitle');
        const deleteBtn = this.element.querySelector('#deleteEventBtn');

        // Reset form
        form.reset();
        
        if (event) {
            // Edit mode
            titleElement.textContent = 'Edit Event';
            deleteBtn.style.display = 'inline-block';
            deleteBtn.dataset.eventId = event.id;
            
            // Fill form with event data
            this.element.querySelector('#eventTitle').value = event.summary || '';
            this.element.querySelector('#eventDescription').value = event.description || '';
            this.element.querySelector('#eventLocation').value = event.location || '';
            
            // Set color selection
            const colorId = event.colorId || '9';
            const colorRadio = this.element.querySelector(`input[name="eventColor"][value="${colorId}"]`);
            if (colorRadio) {
                colorRadio.checked = true;
            }
            
            if (event.isAllDay) {
                this.element.querySelector('#eventAllDay').checked = true;
                this.element.querySelector('#eventStartDate').value = event.startDate;
                this.element.querySelector('#eventEndDate').value = event.endDate;
                this.element.querySelector('#eventStartTime').disabled = true;
                this.element.querySelector('#eventEndTime').disabled = true;
            } else {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                
                this.element.querySelector('#eventStartDate').value = startDate.toISOString().split('T')[0];
                this.element.querySelector('#eventStartTime').value = startDate.toTimeString().slice(0, 5);
                this.element.querySelector('#eventEndDate').value = endDate.toISOString().split('T')[0];
                this.element.querySelector('#eventEndTime').value = endDate.toTimeString().slice(0, 5);
            }
            
            form.dataset.eventId = event.id;
        } else {
            // Add mode
            titleElement.textContent = 'Add Event';
            deleteBtn.style.display = 'none';
            delete form.dataset.eventId;
            
            // Pre-fill date if provided
            if (presetDate) {
                const dateStr = presetDate.toISOString().split('T')[0];
                this.element.querySelector('#eventStartDate').value = dateStr;
                this.element.querySelector('#eventEndDate').value = dateStr;
            }
        }

        modal.style.display = 'flex';
    }

    hideEventModal() {
        this.element.querySelector('#eventModal').style.display = 'none';
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const isEdit = !!form.dataset.eventId;
        
        try {
            const selectedColor = this.element.querySelector('input[name="eventColor"]:checked').value;
            
            const eventData = this.calendarAPI.createEventData({
                title: this.element.querySelector('#eventTitle').value,
                description: this.element.querySelector('#eventDescription').value,
                location: this.element.querySelector('#eventLocation').value,
                startDateTime: this.element.querySelector('#eventAllDay').checked 
                    ? this.element.querySelector('#eventStartDate').value
                    : `${this.element.querySelector('#eventStartDate').value}T${this.element.querySelector('#eventStartTime').value}`,
                endDateTime: this.element.querySelector('#eventAllDay').checked
                    ? this.element.querySelector('#eventEndDate').value
                    : `${this.element.querySelector('#eventEndDate').value}T${this.element.querySelector('#eventEndTime').value}`,
                isAllDay: this.element.querySelector('#eventAllDay').checked,
                colorId: selectedColor
            });

            if (isEdit) {
                await this.calendarAPI.updateEvent(form.dataset.eventId, eventData);
                this.updateStatus('Event updated');
            } else {
                await this.calendarAPI.createEvent(eventData);
                this.updateStatus('Event created');
            }

            this.hideEventModal();
            await this.loadEvents();
        } catch (error) {
            console.error('Failed to save event:', error);
            this.updateStatus('Failed to save event');
        }
    }

    async handleEventDelete() {
        const eventId = this.element.querySelector('#deleteEventBtn').dataset.eventId;
        
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await this.calendarAPI.deleteEvent(eventId);
                this.hideEventModal();
                await this.loadEvents();
                this.updateStatus('Event deleted');
            } catch (error) {
                console.error('Failed to delete event:', error);
                this.updateStatus('Failed to delete event');
            }
        }
    }

    updateStatus(message) {
        this.element.querySelector('#calendarStatus').textContent = message;
    }

    // Render events for a specific day with intelligent overflow handling
    renderDayEvents(dayEvents, day) {
        if (dayEvents.length === 0) {
            return '<div class="day-events"></div>';
        }

        // For days with many events, use different display strategies
        if (dayEvents.length <= 4) {
            // Show all events directly (up to 4)
            return `
                <div class="day-events">
                    ${dayEvents.map(event => `
                        <div class="day-event" title="${CalendarAPI.escapeHtml(event.summary)}" 
                             data-event-id="${event.id}"
                             style="background-color: ${event.color?.background || '#5484ed'}; color: ${event.color?.foreground || '#ffffff'};">
                            ${CalendarAPI.escapeHtml(event.summary.substring(0, 12))}${event.summary.length > 12 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (dayEvents.length <= 8) {
            // Show first 3 events + expandable indicator
            return `
                <div class="day-events">
                    ${dayEvents.slice(0, 3).map(event => `
                        <div class="day-event" title="${CalendarAPI.escapeHtml(event.summary)}" 
                             data-event-id="${event.id}"
                             style="background-color: ${event.color?.background || '#5484ed'}; color: ${event.color?.foreground || '#ffffff'};">
                            ${CalendarAPI.escapeHtml(event.summary.substring(0, 10))}${event.summary.length > 10 ? '...' : ''}
                        </div>
                    `).join('')}
                    <div class="day-event-more" data-day="${day}" title="Click to see all ${dayEvents.length} events">
                        +${dayEvents.length - 3} more
                    </div>
                </div>
            `;
        } else {
            // Many events - show compact view with total count
            return `
                <div class="day-events day-events-many">
                    <div class="day-event-first" title="${CalendarAPI.escapeHtml(dayEvents[0].summary)}" 
                         data-event-id="${dayEvents[0].id}"
                         style="background-color: ${dayEvents[0].color?.background || '#5484ed'}; color: ${dayEvents[0].color?.foreground || '#ffffff'};">
                        ${CalendarAPI.escapeHtml(dayEvents[0].summary.substring(0, 10))}${dayEvents[0].summary.length > 10 ? '...' : ''}
                    </div>
                    <div class="day-event-count" data-day="${day}" title="Click to see all ${dayEvents.length} events">
                        ${dayEvents.length} events
                    </div>
                </div>
            `;
        }
    }

    // Calendar settings management
    setSelectedCalendars(calendarIds) {
        this.selectedCalendars = [...calendarIds];
        console.log('📋 Calendar widget updated with calendars:', this.selectedCalendars);
        
        // Save to localStorage for persistence
        try {
            localStorage.setItem('dashboard-selected-calendars', JSON.stringify(this.selectedCalendars));
        } catch (error) {
            console.error('❌ Error saving selected calendars to storage:', error);
        }
    }

    getSelectedCalendars() {
        return this.selectedCalendars;
    }
}

// Export for use in dashboard

// Export for use in dashboard
window.CalendarWidget = CalendarWidget;
