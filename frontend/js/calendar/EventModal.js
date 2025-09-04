// Modal management for calendar events
class EventModal {
    constructor() {
        this.modal = document.getElementById('event-modal');
        this.form = document.getElementById('event-form');
        this.title = document.getElementById('modal-title');
    }

    show(eventData = null) {
        if (!this.modal || !this.form) {
            console.error('Modal ou formulaire non trouvé');
            return;
        }

        // Reset form
        this.form.reset();
        
        if (eventData) {
            // Mode édition
            this.title.textContent = 'Modifier l\'événement';
            this.populateForm(eventData);
            this.form.dataset.eventId = eventData.id;
            this.form.dataset.mode = 'edit';
        } else {
            // Mode création
            this.title.textContent = 'Nouvel événement';
            this.form.dataset.mode = 'create';
            delete this.form.dataset.eventId;
            
            // Set default date to today
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const timeStr = today.toTimeString().slice(0, 5);
            
            document.getElementById('event-date').value = dateStr;
            document.getElementById('event-start-time').value = timeStr;
        }

        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
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

    setupEventListeners() {
        // Close modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hide();
        });

        // Cancel button
        document.getElementById('cancel-event')?.addEventListener('click', () => {
            this.hide();
        });

        // Click outside modal to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target.id === 'event-modal') {
                this.hide();
            }
        });

        // All-day toggle
        document.getElementById('event-all-day')?.addEventListener('change', () => {
            this.toggleTimeInputs();
        });
    }
}

export default EventModal;
