/**
 * Event Modal Component
 * Handles the create/edit event modal dialog
 */

class EventModal {
    constructor() {
        this.isOpen = false;
        this.currentEventId = null;
        this.onSave = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHtml = `
            <div id="eventModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modalTitle">Create Event</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm">
                            <div class="form-group">
                                <label for="eventTitle">Title:</label>
                                <input type="text" id="eventTitle" name="title" required>
                            </div>
                            <div class="form-group">
                                <label for="eventDescription">Description:</label>
                                <textarea id="eventDescription" name="description" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="eventDate">Date:</label>
                                <input type="date" id="eventDate" name="date" required>
                            </div>
                            <div class="form-group">
                                <label for="eventStartTime">Start Time:</label>
                                <input type="time" id="eventStartTime" name="startTime" required>
                            </div>
                            <div class="form-group">
                                <label for="eventEndTime">End Time:</label>
                                <input type="time" id="eventEndTime" name="endTime" required>
                            </div>
                            <div class="form-group">
                                <label for="eventLocation">Location:</label>
                                <input type="text" id="eventLocation" name="location">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-cancel">Cancel</button>
                        <button type="button" class="btn btn-save">Save</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    bindEvents() {
        const modal = document.getElementById('eventModal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const saveBtn = modal.querySelector('.btn-save');
        const form = document.getElementById('eventForm');

        // Close modal events
        closeBtn.onclick = () => this.close();
        cancelBtn.onclick = () => this.close();
        
        // Close when clicking outside
        window.onclick = (event) => {
            if (event.target === modal) {
                this.close();
            }
        };

        // Save event
        saveBtn.onclick = () => this.save();
        
        // Save on form submit
        form.onsubmit = (e) => {
            e.preventDefault();
            this.save();
        };
    }

    open(eventData = null) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        
        this.isOpen = true;
        this.currentEventId = eventData ? eventData.id : null;
        
        // Set modal title
        modalTitle.textContent = eventData ? 'Edit Event' : 'Create Event';
        
        // Populate form if editing
        if (eventData) {
            this.populateForm(eventData);
        } else {
            this.clearForm();
        }
        
        modal.style.display = 'block';
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('eventTitle').focus();
        }, 100);
    }

    close() {
        const modal = document.getElementById('eventModal');
        modal.style.display = 'none';
        this.isOpen = false;
        this.currentEventId = null;
        this.clearForm();
    }

    populateForm(eventData) {
        document.getElementById('eventTitle').value = eventData.title || '';
        document.getElementById('eventDescription').value = eventData.description || '';
        
        // Handle date formatting
        if (eventData.date) {
            const date = new Date(eventData.date);
            document.getElementById('eventDate').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('eventStartTime').value = eventData.startTime || '';
        document.getElementById('eventEndTime').value = eventData.endTime || '';
        document.getElementById('eventLocation').value = eventData.location || '';
    }

    clearForm() {
        const form = document.getElementById('eventForm');
        form.reset();
    }

    getFormData() {
        return {
            title: document.getElementById('eventTitle').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            date: document.getElementById('eventDate').value,
            startTime: document.getElementById('eventStartTime').value,
            endTime: document.getElementById('eventEndTime').value,
            location: document.getElementById('eventLocation').value.trim()
        };
    }

    validateForm(data) {
        const errors = [];

        if (!data.title) {
            errors.push('Title is required');
        }

        if (!data.date) {
            errors.push('Date is required');
        }

        if (!data.startTime) {
            errors.push('Start time is required');
        }

        if (!data.endTime) {
            errors.push('End time is required');
        }

        if (data.startTime && data.endTime && data.startTime >= data.endTime) {
            errors.push('End time must be after start time');
        }

        return errors;
    }

    async save() {
        try {
            const formData = this.getFormData();
            const errors = this.validateForm(formData);

            if (errors.length > 0) {
                alert('Please fix the following errors:\n' + errors.join('\n'));
                return;
            }

            if (this.onSave) {
                await this.onSave(formData, this.currentEventId);
            }

            this.close();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Error saving event. Please try again.');
        }
    }

    setOnSave(callback) {
        this.onSave = callback;
    }

    destroy() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.remove();
        }
    }
}

export default EventModal;
