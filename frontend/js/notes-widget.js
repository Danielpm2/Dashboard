/**
 * Notes Widget Component
 * Integrates with the Notes API to display and manage notes
 */

class NotesWidget {
    constructor(container) {
        this.container = container;
        this.notesAPI = new NotesAPI();
        this.notes = [];
        this.currentUser = 1; // Default user - you can make this dynamic later
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.loadNotes();
    }

    render() {
        this.container.innerHTML = `
            <div class="widget-header">
                <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                <button class="widget-action-btn" id="add-note-btn" title="Add Note">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="widget-content notes-content">
                <!-- Add Note Form (initially hidden) -->
                <div class="add-note-form hidden" id="add-note-form">
                    <div class="form-group">
                        <textarea 
                            id="note-text" 
                            placeholder="Enter your note..." 
                            maxlength="1000"
                            rows="3"
                        ></textarea>
                        <div class="char-counter">
                            <span id="char-count">0</span>/1000
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="note-color">Color:</label>
                        <div class="color-picker">
                            ${this.generateColorOptions()}
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-primary" id="save-note-btn">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancel-note-btn">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
                
                <!-- Notes List -->
                <div class="notes-list" id="notes-list">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i> Loading notes...
                    </div>
                </div>
            </div>
        `;
    }

    generateColorOptions() {
        const colors = [
            { value: 0, name: 'Default', class: 'color-default' },
            { value: 1, name: 'Yellow', class: 'color-yellow' },
            { value: 2, name: 'Blue', class: 'color-blue' },
            { value: 3, name: 'Green', class: 'color-green' },
            { value: 4, name: 'Pink', class: 'color-pink' },
            { value: 5, name: 'Purple', class: 'color-purple' },
            { value: 6, name: 'Orange', class: 'color-orange' },
            { value: 7, name: 'Red', class: 'color-red' },
            { value: 8, name: 'Teal', class: 'color-teal' },
            { value: 9, name: 'Gray', class: 'color-gray' },
            { value: 10, name: 'Black', class: 'color-black' }
        ];

        return colors.map(color => `
            <label class="color-option">
                <input type="radio" name="note-color" value="${color.value}" ${color.value === 1 ? 'checked' : ''}>
                <span class="color-swatch ${color.class}" title="${color.name}"></span>
            </label>
        `).join('');
    }

    bindEvents() {
        // Add note button
        const addBtn = this.container.querySelector('#add-note-btn');
        addBtn?.addEventListener('click', () => this.showAddForm());

        // Save note button
        const saveBtn = this.container.querySelector('#save-note-btn');
        saveBtn?.addEventListener('click', () => this.saveNote());

        // Cancel button
        const cancelBtn = this.container.querySelector('#cancel-note-btn');
        cancelBtn?.addEventListener('click', () => this.hideAddForm());

        // Character counter
        const noteText = this.container.querySelector('#note-text');
        noteText?.addEventListener('input', (e) => this.updateCharCounter(e.target.value.length));

        // Enter key to save (Ctrl+Enter)
        noteText?.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.saveNote();
            }
        });
    }

    showAddForm() {
        const form = this.container.querySelector('#add-note-form');
        const addBtn = this.container.querySelector('#add-note-btn');
        
        form?.classList.remove('hidden');
        addBtn?.classList.add('hidden');
        
        // Focus on textarea
        const textarea = this.container.querySelector('#note-text');
        textarea?.focus();
    }

    hideAddForm() {
        const form = this.container.querySelector('#add-note-form');
        const addBtn = this.container.querySelector('#add-note-btn');
        
        form?.classList.add('hidden');
        addBtn?.classList.remove('hidden');
        
        // Reset form
        this.resetForm();
    }

    resetForm() {
        const noteText = this.container.querySelector('#note-text');
        const colorInputs = this.container.querySelectorAll('input[name="note-color"]');
        
        if (noteText) noteText.value = '';
        colorInputs.forEach(input => input.checked = input.value === '1');
        this.updateCharCounter(0);
    }

    updateCharCounter(count) {
        const counter = this.container.querySelector('#char-count');
        if (counter) {
            counter.textContent = count;
            counter.parentElement.classList.toggle('limit-warning', count > 900);
        }
    }

    async saveNote() {
        try {
            const noteText = this.container.querySelector('#note-text');
            const selectedColor = this.container.querySelector('input[name="note-color"]:checked');

            if (!noteText?.value.trim()) {
                this.showError('Please enter a note');
                return;
            }

            const noteData = {
                note: noteText.value.trim(),
                color: parseInt(selectedColor?.value || '1'),
                user: this.currentUser
            };

            // Show saving state
            const saveBtn = this.container.querySelector('#save-note-btn');
            const originalContent = saveBtn?.innerHTML;
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            await this.notesAPI.createNote(noteData);
            
            this.hideAddForm();
            await this.loadNotes();
            this.showSuccess('Note saved successfully!');

        } catch (error) {
            this.showError(`Failed to save note: ${error.message}`);
        } finally {
            // Reset save button
            const saveBtn = this.container.querySelector('#save-note-btn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                saveBtn.disabled = false;
            }
        }
    }

    async loadNotes() {
        try {
            const notesList = this.container.querySelector('#notes-list');
            if (notesList) {
                notesList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading notes...</div>';
            }

            this.notes = await this.notesAPI.getAllNotes();
            this.renderNotes();

        } catch (error) {
            console.error('Failed to load notes:', error);
            this.showError('Failed to load notes');
            this.renderEmptyState();
        }
    }

    renderNotes() {
        const notesList = this.container.querySelector('#notes-list');
        if (!notesList) return;

        if (this.notes.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Sort notes by time (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => new Date(b.time) - new Date(a.time));

        notesList.innerHTML = sortedNotes.map(note => this.renderNoteItem(note)).join('');

        // Bind delete events
        notesList.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNote(parseInt(btn.dataset.noteId));
            });
        });
    }

    renderNoteItem(note) {
        const colorClass = this.getColorClass(note.color);
        const timeAgo = this.formatTimeAgo(new Date(note.time));
        const escapedNote = NotesAPI.escapeHtml(note.note);

        return `
            <div class="note-item ${colorClass}" data-note-id="${note.id}">
                <div class="note-content">
                    <p class="note-text">${escapedNote}</p>
                    <div class="note-meta">
                        <span class="note-time" title="${new Date(note.time).toLocaleString()}">
                            <i class="fas fa-clock"></i> ${timeAgo}
                        </span>
                    </div>
                </div>
                <button class="delete-note-btn" data-note-id="${note.id}" title="Delete note">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        const notesList = this.container.querySelector('#notes-list');
        if (notesList) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <p>No notes yet</p>
                    <small>Click the + button to add your first note</small>
                </div>
            `;
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await this.notesAPI.deleteNote(noteId);
            await this.loadNotes();
            this.showSuccess('Note deleted successfully!');
        } catch (error) {
            this.showError(`Failed to delete note: ${error.message}`);
        }
    }

    getColorClass(colorValue) {
        const colorMap = {
            0: 'color-default',
            1: 'color-yellow',
            2: 'color-blue',
            3: 'color-green',
            4: 'color-pink',
            5: 'color-purple',
            6: 'color-orange',
            7: 'color-red',
            8: 'color-teal',
            9: 'color-gray',
            10: 'color-black'
        };
        return colorMap[colorValue] || 'color-default';
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Simple notification system - you can enhance this
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export for use in other modules
window.NotesWidget = NotesWidget;
