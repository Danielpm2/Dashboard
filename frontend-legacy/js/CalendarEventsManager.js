// Main Calendar Events Manager - reorganized and simplified
import CalendarAPI from './calendar/CalendarAPI.js';
import EventModal from './calendar/EventModal.js';
import NotificationManager from './calendar/NotificationManager.js';
import DashboardUtils from './calendar/DashboardUtils.js';

class CalendarEventsManager {
    constructor() {
        this.api = new CalendarAPI();
        this.modal = new EventModal();
        this.events = [];
        
        this.initializeEventListeners();
        this.loadEvents();
    }

    initializeEventListeners() {
        // Add event button
        document.getElementById('add-event-btn')?.addEventListener('click', () => {
            this.modal.show();
        });

        // Calendar refresh button
        document.getElementById('calendar-refresh')?.addEventListener('click', async () => {
            await this.loadEvents();
        });

        // Event form submission
        document.getElementById('event-form')?.addEventListener('submit', (e) => {
            this.handleEventSubmit(e);
        });

        // Setup modal event listeners
        this.modal.setupEventListeners();
    }

    async loadEvents() {
        try {
            const data = await this.api.loadEvents();
            
            if (data.success) {
                // Store events for internal use
                this.events = data.events;
                
                // Dispatch custom event for visual calendar manager
                document.dispatchEvent(new CustomEvent('calendar-events-updated', {
                    detail: { events: data.events }
                }));
                
                // Refresh the main dashboard calendar display
                await DashboardUtils.refreshCalendar();
            } else {
                console.error('Erreur chargement événements:', data.error);
                NotificationManager.error('Erreur lors du chargement des événements');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            NotificationManager.error('Erreur de connexion');
        }
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const eventId = form.dataset.eventId;
        
        const eventData = this.modal.collectFormData();
        
        try {
            let response;
            if (mode === 'edit' && eventId) {
                response = await this.api.updateEvent(eventId, eventData);
            } else {
                response = await this.api.createEvent(eventData);
            }
            
            if (response.success) {
                this.modal.hide();
                console.log('Event saved successfully, refreshing dashboard...');
                
                NotificationManager.success(
                    mode === 'edit' ? 'Événement modifié avec succès' : 'Événement créé avec succès'
                );
                
                // Reload events to update both views
                await this.loadEvents();
            } else {
                NotificationManager.error(response.error || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            NotificationManager.error('Erreur de connexion');
        }
    }

    async editEvent(eventId) {
        try {
            const data = await this.api.getEvent(eventId);
            
            if (data.success) {
                this.modal.show(data.event);
            } else {
                NotificationManager.error('Erreur lors du chargement de l\'événement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            NotificationManager.error('Erreur de connexion');
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }
        
        try {
            const data = await this.api.deleteEvent(eventId);
            
            if (data.success) {
                console.log('Event deleted successfully, refreshing dashboard...');
                NotificationManager.success('Événement supprimé avec succès');
                
                // Reload events to update both views
                await this.loadEvents();
            } else {
                NotificationManager.error(data.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            NotificationManager.error('Erreur de connexion');
        }
    }

    // Get current events for other managers
    getEvents() {
        return this.events;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendarEventsManager = new CalendarEventsManager();
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

export default CalendarEventsManager;
