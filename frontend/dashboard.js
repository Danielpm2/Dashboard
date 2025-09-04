class Dashboard {
    constructor() {
        console.log('Dashboard constructor called');
        this.apiUrl = 'http://localhost:3000/api';
        this.panels = {};
        this.init();
    }

    async init() {
        console.log('Dashboard init called');
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Load panels with error handling
        try {
            await this.loadPanels();
        } catch (error) {
            console.error('Failed to load panels from API, using defaults:', error);
            this.loadDefaultPanels();
        }
        
        this.setupEventListeners();
        this.setupCalendarRefresh();
        this.loadGoogleCalendar();
        console.log('Dashboard initialization complete');
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateString = now.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = `${dateString} ${timeString}`;
        }
    }

    async loadPanels() {
        try {
            console.log('Loading panels from API...');
            const response = await fetch(`${this.apiUrl}/panels`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Panels loaded from API:', data);
            this.panels = data.panels || {};
            
            // If no panels exist, load defaults
            if (Object.keys(this.panels).length === 0) {
                console.log('No panels found, loading defaults');
                this.loadDefaultPanels();
            } else {
                this.renderPanels();
            }
        } catch (error) {
            console.error('Failed to load panels:', error);
            this.loadDefaultPanels();
        }
    }

    loadDefaultPanels() {
        console.log('Loading default panels...');
        this.panels = {
            left: {
                title: 'My Projects',
                widgets: [
                    { id: 1, title: 'Current Work', content: '', color: '#00d563' },
                    { id: 2, title: 'Side Projects', content: '', color: '#00d563' },
                    { id: 3, title: 'Ideas & Notes', content: '', color: '#00d563' },
                    { id: 4, title: 'Learning Goals', content: '', color: '#00d563' }
                ]
            },
            center: {
                title: "Today's Focus",
                widgets: [
                    { id: 5, title: 'Priority Tasks', content: '', color: '#00d563', large: true },
                    { id: 6, title: 'Deadlines', content: '', color: '#00d563', small: true },
                    { id: 7, title: 'Quick Notes', content: '', color: '#00d563', small: true },
                    { id: 8, title: 'Weekly Progress', content: '', color: '#00d563' }
                ]
            },
            right: {
                title: 'Life Stuff',
                widgets: [
                    { id: 9, title: 'Calendar', content: '', color: '#00d563' },
                    { id: 10, title: 'Reminders', content: '', color: '#00d563' },
                    { id: 11, title: 'Habits Tracker', content: '', color: '#00d563' },
                    { id: 12, title: 'Random Thoughts', content: '', color: '#00d563' }
                ]
            }
        };
        this.renderPanels();
        console.log('Default panels loaded and rendered');
    }

    renderPanels() {
        Object.keys(this.panels).forEach(panelKey => {
            this.renderPanel(panelKey, this.panels[panelKey]);
        });
    }

    renderPanel(panelKey, panelData) {
        const section = document.querySelector(`.${panelKey}-section`);
        if (!section) return;

        const header = section.querySelector('h2');
        if (header) {
            header.innerHTML = `
                ${panelData.title}
                <button class="settings-btn" onclick="dashboard.openPanelSettings('${panelKey}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            `;
        }

        const container = section.querySelector('.widget-container');
        if (!container) return;

        container.innerHTML = '';

        if (panelKey === 'center') {
            this.renderCenterPanelWidgets(container, panelData.widgets);
        } else {
            panelData.widgets.forEach(widget => {
                const widgetElement = this.createWidgetElement(widget);
                container.appendChild(widgetElement);
            });
        }
    }

    renderCenterPanelWidgets(container, widgets) {
        widgets.forEach((widget, index) => {
            if (widget.large) {
                const widgetElement = this.createWidgetElement(widget, 'large-widget');
                container.appendChild(widgetElement);
            } else if (widget.small && widgets.find(w => w.small && w.id !== widget.id)) {
                // Create row for small widgets
                let rowElement = container.querySelector('.widget-row');
                if (!rowElement) {
                    rowElement = document.createElement('div');
                    rowElement.className = 'widget-row';
                    container.appendChild(rowElement);
                }
                const widgetElement = this.createWidgetElement(widget, 'small-widget');
                rowElement.appendChild(widgetElement);
            } else {
                const widgetElement = this.createWidgetElement(widget);
                container.appendChild(widgetElement);
            }
        });
    }

    createWidgetElement(widget, extraClass = '') {
        const widgetDiv = document.createElement('div');
        widgetDiv.className = `widget ${extraClass}`;
        widgetDiv.style.borderColor = widget.color || '#00d563';
        
        widgetDiv.innerHTML = `
            <h3>${widget.title}</h3>
            <div class="widget-content" style="border-color: ${widget.color || '#00d563'}">
                ${widget.content || ''}
            </div>
        `;
        
        return widgetDiv;
    }

    openPanelSettings(panelKey) {
        console.log('Opening panel settings for:', panelKey);
        const panel = this.panels[panelKey];
        
        if (!panel) {
            console.error('Panel not found:', panelKey);
            alert('Panel not found. Please refresh the page and try again.');
            return;
        }

        try {
            const modal = this.createSettingsModal(panelKey, panel);
            document.body.appendChild(modal);
            modal.style.display = 'flex';
            console.log('Settings modal opened for:', panelKey);
        } catch (error) {
            console.error('Error opening settings modal:', error);
            alert('Error opening settings. Please try again.');
        }
    }

    createSettingsModal(panelKey, panel) {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h3>Panel Settings</h3>
                    <button class="close-btn" onclick="this.closest('.settings-modal').remove()">×</button>
                </div>
                <div class="settings-body">
                    <div class="setting-group">
                        <label>Panel Name:</label>
                        <input type="text" id="panel-name" value="${panel.title}">
                    </div>
                    <div class="setting-group">
                        <label>Widgets:</label>
                        <div class="widgets-list" id="widgets-list">
                            ${panel.widgets.map(widget => `
                                <div class="widget-item" data-widget-id="${widget.id}">
                                    <input type="text" value="${widget.title}" placeholder="Widget title">
                                    <input type="color" value="${widget.color}" title="Widget color">
                                    <textarea placeholder="Widget content">${widget.content}</textarea>
                                    <button onclick="dashboard.removeWidget('${panelKey}', ${widget.id})">Remove</button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="add-widget-btn" onclick="dashboard.addWidget('${panelKey}')">Add Widget</button>
                    </div>
                    <div class="settings-actions">
                        <button class="save-btn" onclick="dashboard.savePanelSettings('${panelKey}')">Save Changes</button>
                        <button class="cancel-btn" onclick="this.closest('.settings-modal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    addWidget(panelKey) {
        const newWidget = {
            id: Date.now(),
            title: 'New Widget',
            content: '',
            color: '#00d563'
        };
        
        this.panels[panelKey].widgets.push(newWidget);
        
        const widgetsList = document.getElementById('widgets-list');
        const widgetItem = document.createElement('div');
        widgetItem.className = 'widget-item';
        widgetItem.setAttribute('data-widget-id', newWidget.id);
        widgetItem.innerHTML = `
            <input type="text" value="${newWidget.title}" placeholder="Widget title">
            <input type="color" value="${newWidget.color}" title="Widget color">
            <textarea placeholder="Widget content">${newWidget.content}</textarea>
            <button onclick="dashboard.removeWidget('${panelKey}', ${newWidget.id})">Remove</button>
        `;
        widgetsList.appendChild(widgetItem);
    }

    removeWidget(panelKey, widgetId) {
        this.panels[panelKey].widgets = this.panels[panelKey].widgets.filter(w => w.id !== widgetId);
        const widgetItem = document.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widgetItem) {
            widgetItem.remove();
        }
    }

    async savePanelSettings(panelKey) {
        const modal = document.querySelector('.settings-modal');
        const panelName = document.getElementById('panel-name').value;
        const widgetItems = document.querySelectorAll('.widget-item');
        
        this.panels[panelKey].title = panelName;
        this.panels[panelKey].widgets = Array.from(widgetItems).map(item => {
            const inputs = item.querySelectorAll('input, textarea');
            return {
                id: parseInt(item.getAttribute('data-widget-id')),
                title: inputs[0].value,
                color: inputs[1].value,
                content: inputs[2].value
            };
        });

        try {
            console.log('Saving panels to API:', this.panels);
            const response = await fetch(`${this.apiUrl}/panels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ panels: this.panels })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Save successful:', result);
            
            this.renderPanel(panelKey, this.panels[panelKey]);
            modal.remove();
            
            // Show success message
            this.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save panel settings:', error);
            
            // Show detailed error message
            let errorMessage = 'Failed to save settings. ';
            if (error.message.includes('fetch')) {
                errorMessage += 'Cannot connect to server. Make sure the backend is running on port 3000.';
            } else {
                errorMessage += error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Google Calendar functionality
    async loadGoogleCalendar() {
        const calendarContainer = document.getElementById('calendar-events');
        const loadingDiv = document.getElementById('calendar-loading');
        const refreshBtn = document.getElementById('calendar-refresh');
        
        console.log('loadGoogleCalendar called');
        console.log('Calendar container:', calendarContainer);
        console.log('Loading div:', loadingDiv);
        console.log('Refresh btn:', refreshBtn);
        
        if (!calendarContainer) {
            console.error('Calendar container not found!');
            return;
        }
        
        try {
            // Show loading state
            if (loadingDiv) loadingDiv.style.display = 'block';
            if (refreshBtn) refreshBtn.disabled = true;
            
            console.log('Loading Google Calendar events...');
            const response = await fetch(`${this.apiUrl}/calendar/events/formatted`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Calendar events loaded:', data);
            
            // Hide loading state
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (refreshBtn) refreshBtn.disabled = false;
            
            if (data.success && data.events && data.events.length > 0) {
                console.log('Displaying events:', data.events);
                this.displayCalendarEvents(data.events);
            } else {
                console.log('No events found, showing no events message');
                this.displayNoEvents();
            }
            
        } catch (error) {
            console.error('Error loading calendar events:', error);
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (refreshBtn) refreshBtn.disabled = false;
            this.displayCalendarError();
        }
    }
    
    displayCalendarEvents(events) {
        const calendarContainer = document.getElementById('calendar-events');
        if (!calendarContainer) return;
        
        calendarContainer.innerHTML = events.map(event => `
            <div class="calendar-event ${event.isToday ? 'today' : ''} ${event.isOngoing ? 'ongoing' : ''}">
                <div class="calendar-event-time">${event.formattedTime}</div>
                <div class="calendar-event-title">${event.title}</div>
                ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                ${event.description ? `<div class="calendar-event-description">${event.description}</div>` : ''}
            </div>
        `).join('');
    }
    
    displayNoEvents() {
        const calendarContainer = document.getElementById('calendar-events');
        if (!calendarContainer) return;
        
        calendarContainer.innerHTML = `
            <div class="no-events">
                <div class="no-events-icon">📅</div>
                <div class="no-events-text">No upcoming events</div>
            </div>
        `;
    }
    
    displayCalendarError() {
        const calendarContainer = document.getElementById('calendar-events');
        if (!calendarContainer) return;
        
        calendarContainer.innerHTML = `
            <div class="calendar-error">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Failed to load calendar events</div>
                <button onclick="dashboard.loadGoogleCalendar()" class="retry-btn">Retry</button>
            </div>
        `;
    }
    
    setupCalendarRefresh() {
        const refreshBtn = document.getElementById('calendar-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadGoogleCalendar();
            });
        }
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;

// Global function to handle settings clicks
window.openPanelSettings = function(panelKey) {
    console.log('Opening settings for panel:', panelKey);
    if (dashboard && dashboard.openPanelSettings) {
        dashboard.openPanelSettings(panelKey);
    } else {
        console.log('Dashboard not ready yet, creating fallback modal...');
        createFallbackModal(panelKey);
    }
};

// Test function to verify JavaScript is working
window.testFunction = function() {
    alert('JavaScript is working!');
    console.log('Test function called');
};

// Fallback modal creation
function createFallbackModal(panelKey) {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <h3>Panel Settings - ${panelKey}</h3>
                <button class="close-btn" onclick="this.closest('.settings-modal').remove()">×</button>
            </div>
            <div class="settings-body">
                <p>Dashboard is loading... Please wait a moment and try again.</p>
                <div class="settings-actions">
                    <button class="cancel-btn" onclick="this.closest('.settings-modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    try {
        dashboard = new Dashboard();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});
