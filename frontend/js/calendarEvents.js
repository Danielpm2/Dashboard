// Calendar Events Management
class CalendarEventsManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.events = [];
        this.initializeEventListeners();
        this.loadEvents();
    }

    initializeEventListeners() {
        // Add event button
        document.getElementById('add-event-btn')?.addEventListener('click', () => {
            this.showEventModal();
        });

        // Calendar refresh button
        document.getElementById('calendar-refresh')?.addEventListener('click', async () => {
            await this.loadEvents();
        });

        // Event form submission
        document.getElementById('event-form')?.addEventListener('submit', (e) => {
            this.handleEventSubmit(e);
        });

        // Close modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hideEventModal();
        });

        // Cancel button
        document.getElementById('cancel-event')?.addEventListener('click', () => {
            this.hideEventModal();
        });

        // Click outside modal to close
        document.getElementById('event-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'event-modal') {
                this.hideEventModal();
            }
        });
    }

    async loadEvents() {
        try {
            const response = await fetch(`${this.baseUrl}/calendar/events/formatted`);
            const data = await response.json();
            
            if (data.success) {
                // Store events for internal use but don't display them
                // Let the dashboard handle the display
                this.events = data.events;
                
                // Just refresh the main dashboard calendar display
                if (window.dashboard) {
                    await window.dashboard.loadGoogleCalendar();
                }
            } else {
                console.error('Erreur chargement événements:', data.error);
                this.showNotification('Erreur lors du chargement des événements', 'error');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    displayEvents(events) {
        const container = document.getElementById('calendar-events');
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <p>Aucun événement trouvé</p>
                    <p class="no-events-tip">Utilisez le bouton "Add Event" ci-dessus pour créer votre premier événement.</p>
                </div>
            `;
            return;
        }

        const eventsHtml = events.map(event => this.createEventHtml(event)).join('');
        container.innerHTML = `
            <div class="events-list">
                ${eventsHtml}
            </div>
        `;
    }

    createEventHtml(event) {
        // Use the formatted time from backend or format it here
        let timeFormat;
        if (event.formattedTime) {
            timeFormat = event.formattedTime;
        } else {
            // Fallback formatting
            const isAllDay = !event.start || typeof event.start === 'string' && !event.start.includes('T');
            if (isAllDay) {
                const startDate = new Date(event.start + (event.start.includes('T') ? '' : 'T00:00:00'));
                timeFormat = startDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });
            } else {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    timeFormat = `${startDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${endDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`;
                } else {
                    timeFormat = 'Heure non disponible';
                }
            }
        }

        // Show ongoing status
        const statusText = event.isOngoing ? ' (En cours)' : (event.isToday ? ' (Aujourd\'hui)' : '');

        return `
            <div class="event-item" data-event-id="${event.id}" 
                 data-ongoing="${event.isOngoing || false}" 
                 data-today="${event.isToday || false}"
                 style="cursor: pointer;" title="Cliquer pour modifier">
                <div class="event-content">
                    <div class="event-header">
                        <h4 class="event-title">${event.summary || event.title || 'Sans titre'}</h4>
                        <div class="event-actions" onclick="event.stopPropagation();">
                            <button class="btn-icon edit-event-btn" data-event-id="${event.id}" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-event-btn" data-event-id="${event.id}" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="event-time">
                        <i class="fas fa-clock"></i>
                        <span>${timeFormat}${statusText}</span>
                    </div>
                    ${event.description ? `
                        <div class="event-description">
                            <i class="fas fa-align-left"></i>
                            <span>${event.description}</span>
                        </div>
                    ` : ''}
                    ${event.location ? `
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showEventModal(eventData = null) {
        const modal = document.getElementById('event-modal');
        const form = document.getElementById('event-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form) {
            console.error('Modal ou formulaire non trouvé');
            return;
        }

        // Reset form
        form.reset();
        
        if (eventData) {
            // Mode édition
            title.textContent = 'Modifier l\'événement';
            this.populateForm(eventData);
            form.dataset.eventId = eventData.id;
            form.dataset.mode = 'edit';
        } else {
            // Mode création
            title.textContent = 'Nouvel événement';
            form.dataset.mode = 'create';
            delete form.dataset.eventId;
            
            // Set default date to today
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const timeStr = today.toTimeString().slice(0, 5);
            
            document.getElementById('event-date').value = dateStr;
            document.getElementById('event-start-time').value = timeStr;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideEventModal() {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    populateForm(eventData) {
        const startDate = new Date(eventData.start.dateTime || eventData.start.date);
        const endDate = new Date(eventData.end.dateTime || eventData.end.date);
        
        document.getElementById('event-title').value = eventData.summary || '';
        document.getElementById('event-description').value = eventData.description || '';
        document.getElementById('event-location').value = eventData.location || '';
        
        const isAllDay = !eventData.start.dateTime;
        document.getElementById('event-all-day').checked = isAllDay;
        
        document.getElementById('event-date').value = startDate.toISOString().split('T')[0];
        
        if (!isAllDay) {
            document.getElementById('event-start-time').value = startDate.toTimeString().slice(0, 5);
            document.getElementById('event-end-time').value = endDate.toTimeString().slice(0, 5);
        }
        
        this.toggleTimeInputs();
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const eventId = form.dataset.eventId;
        
        const eventData = this.collectFormData();
        
        try {
            let response;
            if (mode === 'edit' && eventId) {
                response = await this.updateEvent(eventId, eventData);
            } else {
                response = await this.createEvent(eventData);
            }
            
            if (response.success) {
                this.hideEventModal();
                console.log('Event saved successfully, refreshing dashboard...');
                
                this.showNotification(
                    mode === 'edit' ? 'Événement modifié avec succès' : 'Événement créé avec succès',
                    'success'
                );
                
                // Refresh the main dashboard calendar display
                if (window.dashboard && typeof window.dashboard.loadGoogleCalendar === 'function') {
                    console.log('Dashboard found, calling loadGoogleCalendar...');
                    window.dashboard.loadGoogleCalendar().then(() => {
                        console.log('Dashboard refreshed after save');
                    }).catch(err => {
                        console.error('Error refreshing dashboard:', err);
                    });
                } else {
                    console.error('Dashboard not found or loadGoogleCalendar method not available');
                    console.log('window.dashboard:', window.dashboard);
                }
            } else {
                this.showNotification(response.error || 'Erreur lors de la sauvegarde', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    collectFormData() {
        const title = document.getElementById('event-title').value;
        const description = document.getElementById('event-description').value;
        const location = document.getElementById('event-location').value;
        const date = document.getElementById('event-date').value;
        const startTime = document.getElementById('event-start-time').value;
        const endTime = document.getElementById('event-end-time').value;
        const allDay = document.getElementById('event-all-day').checked;
        
        const eventData = {
            summary: title,
            description: description || null,
            location: location || null
        };
        
        if (allDay) {
            eventData.start = { date: date };
            eventData.end = { date: date };
        } else {
            const startDateTime = new Date(`${date}T${startTime}`);
            let endDateTime;
            
            if (endTime) {
                endDateTime = new Date(`${date}T${endTime}`);
            } else {
                endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour
            }
            
            eventData.start = { dateTime: startDateTime.toISOString() };
            eventData.end = { dateTime: endDateTime.toISOString() };
        }
        
        return eventData;
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

    async editEvent(eventId) {
        try {
            const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showEventModal(data.event);
            } else {
                this.showNotification('Erreur lors du chargement de l\'événement', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Event deleted successfully, refreshing dashboard...');
                this.showNotification('Événement supprimé avec succès', 'success');
                
                // Refresh the main dashboard calendar display
                if (window.dashboard && typeof window.dashboard.loadGoogleCalendar === 'function') {
                    console.log('Dashboard found, calling loadGoogleCalendar...');
                    window.dashboard.loadGoogleCalendar().then(() => {
                        console.log('Dashboard refreshed after deletion');
                    }).catch(err => {
                        console.error('Error refreshing dashboard:', err);
                    });
                } else {
                    console.error('Dashboard not found or loadGoogleCalendar method not available');
                    console.log('window.dashboard:', window.dashboard);
                }
            } else {
                this.showNotification(data.error || 'Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    toggleTimeInputs() {
        const allDayCheckbox = document.getElementById('event-all-day');
        const timeInputs = document.querySelectorAll('.time-input');
        
        if (allDayCheckbox?.checked) {
            timeInputs.forEach(input => {
                input.style.display = 'none';
                input.querySelector('input').required = false;
            });
        } else {
            timeInputs.forEach(input => {
                input.style.display = 'block';
                if (input.querySelector('#event-start-time')) {
                    input.querySelector('input').required = true;
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendarEventsManager = new CalendarEventsManager();
    
    // Setup all-day checkbox toggle
    document.getElementById('event-all-day')?.addEventListener('change', () => {
        window.calendarEventsManager.toggleTimeInputs();
    });
});

// Event delegation pour les boutons d'événements
document.addEventListener('click', function(e) {
    // Bouton d'édition
    if (e.target.matches('.edit-event-btn') || e.target.closest('.edit-event-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = e.target.matches('.edit-event-btn') ? e.target : e.target.closest('.edit-event-btn');
        const eventId = button.dataset.eventId;
        
        console.log('Edit event clicked, ID:', eventId);
        
        if (eventId && window.calendarEventsManager) {
            window.calendarEventsManager.editEvent(eventId);
        } else {
            console.error('Pas d\'ID d\'événement trouvé ou manager non disponible');
        }
        return;
    }
    
    // Bouton de suppression
    if (e.target.matches('.delete-event-btn') || e.target.closest('.delete-event-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = e.target.matches('.delete-event-btn') ? e.target : e.target.closest('.delete-event-btn');
        const eventId = button.dataset.eventId;
        
        console.log('Delete event clicked, ID:', eventId);
        
        if (eventId && window.calendarEventsManager) {
            // Pas de confirm ici, la méthode deleteEvent s'en charge
            window.calendarEventsManager.deleteEvent(eventId);
        } else if (!eventId) {
            console.error('Pas d\'ID d\'événement trouvé pour la suppression');
        }
        return;
    }
    
    // Click sur l'événement entier (pour modification rapide)
    const eventItem = e.target.closest('.event-item');
    if (eventItem && !e.target.closest('.event-actions')) {
        const eventId = eventItem.dataset.eventId;
        console.log('Event item clicked for quick edit, ID:', eventId);
        
        if (eventId && window.calendarEventsManager) {
            window.calendarEventsManager.editEvent(eventId);
        }
    }
});
