class CalendarSettings {
    constructor(calendarWidget) {
        this.calendarWidget = calendarWidget;
        this.calendarAPI = new CalendarAPI();
        this.calendars = [];
        this.selectedCalendars = this.loadSelectedCalendarsFromStorage();
        this.isOpen = false;
        this.init();
    }

    init() {
        this.loadCalendars();
        this.setupEventListeners();
    }

    // Load selected calendars from localStorage
    loadSelectedCalendarsFromStorage() {
        try {
            const saved = localStorage.getItem('dashboard-selected-calendars');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log('📋 Loaded selected calendars from storage:', parsed);
                    return parsed;
                }
            }
        } catch (error) {
            console.error('❌ Error loading selected calendars from storage:', error);
        }
        
        // Default to primary calendar
        return ['primary'];
    }

    // Save selected calendars to localStorage
    saveSelectedCalendarsToStorage() {
        try {
            localStorage.setItem('dashboard-selected-calendars', JSON.stringify(this.selectedCalendars));
            console.log('💾 Saved selected calendars to storage:', this.selectedCalendars);
        } catch (error) {
            console.error('❌ Error saving selected calendars to storage:', error);
        }
    }

    async loadCalendars() {
        try {
            const data = await this.calendarAPI.getCalendars();
            
            if (data.success) {
                this.calendars = data.calendars;
                
                // Don't override stored selections - keep the user's saved preferences
                // But validate that saved calendars still exist
                if (this.selectedCalendars.length > 0) {
                    const availableCalendarIds = data.calendars.map(cal => cal.id);
                    this.selectedCalendars = this.selectedCalendars.filter(id => 
                        availableCalendarIds.includes(id)
                    );
                    
                    // If no saved calendars are valid, use default selection
                    if (this.selectedCalendars.length === 0) {
                        this.selectedCalendars = data.calendars
                            .filter(cal => cal.selected)
                            .map(cal => cal.id);
                    }
                }
                
                console.log('📋 Loaded calendars:', this.calendars);
                console.log('📋 Using selected calendars:', this.selectedCalendars);
                
                // Update the calendar widget with the saved selection
                if (this.calendarWidget) {
                    this.calendarWidget.setSelectedCalendars(this.selectedCalendars);
                }
                
                this.renderSettings();
            } else {
                console.error('❌ Failed to load calendars:', data.error);
            }
        } catch (error) {
            console.error('❌ Error loading calendars:', error);
        }
    }

    setupEventListeners() {
        // Listen for settings button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.settings-btn') || e.target.closest('.settings-btn')) {
                e.preventDefault();
                this.toggleSettings();
            }
            
            if (e.target.matches('.settings-overlay') || e.target.matches('.settings-close')) {
                this.closeSettings();
            }
        });

        // Listen for calendar checkbox changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.calendar-checkbox')) {
                this.handleCalendarToggle(e.target);
            }
        });

        // Listen for apply settings button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.apply-settings-btn')) {
                this.applySettings();
            }
        });
    }

    toggleSettings() {
        if (this.isOpen) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    openSettings() {
        this.isOpen = true;
        this.syncWithCalendarWidget();
        this.renderSettingsModal();
    }

    closeSettings() {
        this.isOpen = false;
        const modal = document.querySelector('.calendar-settings-modal');
        if (modal) {
            modal.remove();
        }
    }

    renderSettingsModal() {
        // Remove existing modal
        const existingModal = document.querySelector('.calendar-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'calendar-settings-modal';
        modal.innerHTML = `
            <div class="settings-overlay"></div>
            <div class="settings-content">
                <div class="settings-header">
                    <h3><i class="fas fa-cog"></i> Calendar Settings</h3>
                    <button class="settings-close" aria-label="Close settings">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="settings-body">
                    <h4>Select Calendars to Display</h4>
                    <p>Choose which calendars you want to see events from:</p>
                    
                    <div class="calendar-list">
                        ${this.renderCalendarList()}
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn-secondary settings-close">Cancel</button>
                    <button class="btn-primary apply-settings-btn">Apply Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Focus trap and accessibility
        setTimeout(() => {
            const firstCheckbox = modal.querySelector('.calendar-checkbox');
            if (firstCheckbox) {
                firstCheckbox.focus();
            }
        }, 100);
    }

    renderCalendarList() {
        if (!this.calendars.length) {
            return '<div class="loading-state">Loading calendars...</div>';
        }

        return this.calendars.map(calendar => {
            const isSelected = this.selectedCalendars.includes(calendar.id);
            const colorStyle = calendar.backgroundColor ? 
                `style="background-color: ${calendar.backgroundColor}; color: ${calendar.foregroundColor || '#ffffff'}"` : '';
            
            return `
                <div class="calendar-item">
                    <label class="calendar-label">
                        <input 
                            type="checkbox" 
                            class="calendar-checkbox" 
                            value="${calendar.id}"
                            ${isSelected ? 'checked' : ''}
                        >
                        <div class="calendar-info">
                            <div class="calendar-indicator" ${colorStyle}></div>
                            <div class="calendar-details">
                                <div class="calendar-name">
                                    ${calendar.name}
                                    ${calendar.primary ? '<span class="primary-badge">Primary</span>' : ''}
                                </div>
                                ${calendar.description ? `<div class="calendar-description">${calendar.description}</div>` : ''}
                                <div class="calendar-access">${this.formatAccessRole(calendar.accessRole)}</div>
                            </div>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    formatAccessRole(role) {
        const roles = {
            'owner': 'Owner',
            'reader': 'Read-only',
            'writer': 'Can edit',
            'freeBusyReader': 'Free/Busy only'
        };
        return roles[role] || role;
    }

    handleCalendarToggle(checkbox) {
        const calendarId = checkbox.value;
        
        if (checkbox.checked) {
            if (!this.selectedCalendars.includes(calendarId)) {
                this.selectedCalendars.push(calendarId);
            }
        } else {
            this.selectedCalendars = this.selectedCalendars.filter(id => id !== calendarId);
        }

        console.log('📋 Selected calendars:', this.selectedCalendars);
    }

    async applySettings() {
        try {
            // Ensure at least one calendar is selected
            if (this.selectedCalendars.length === 0) {
                alert('Please select at least one calendar to display.');
                return;
            }

            // Save settings to backend (for future sessions)
            const response = await this.calendarAPI.updateCalendarSettings(this.selectedCalendars);

            if (response.success) {
                console.log('✅ Calendar settings saved');
                
                // Save to localStorage for persistence
                this.saveSelectedCalendarsToStorage();
                
                // Update the calendar widget with new settings
                if (this.calendarWidget) {
                    this.calendarWidget.setSelectedCalendars(this.selectedCalendars);
                    await this.calendarWidget.loadEvents();
                }

                // Close the settings modal
                this.closeSettings();
                
                // Show success message
                this.showSuccessMessage();
            } else {
                throw new Error('Failed to save settings');
            }

        } catch (error) {
            console.error('❌ Error applying calendar settings:', error);
            alert('Failed to save calendar settings. Please try again.');
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-toast';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Calendar settings updated successfully!
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    getSelectedCalendars() {
        return this.selectedCalendars;
    }

    setSelectedCalendars(calendarIds) {
        this.selectedCalendars = [...calendarIds];
        this.saveSelectedCalendarsToStorage();
    }

    // Sync with calendar widget's current selection
    syncWithCalendarWidget() {
        if (this.calendarWidget) {
            const widgetSelection = this.calendarWidget.getSelectedCalendars();
            if (JSON.stringify(widgetSelection) !== JSON.stringify(this.selectedCalendars)) {
                this.selectedCalendars = [...widgetSelection];
                console.log('📋 Synced calendar settings with widget selection:', this.selectedCalendars);
            }
        }
    }
}

// Export for use by other modules
window.CalendarSettings = CalendarSettings;
