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
                <div class="widget-header-actions">
                    <button class="widget-action-btn" id="refresh-notes-btn" title="Refresh Notes">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="widget-action-btn" id="add-note-btn" title="Add Note">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
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

        // Refresh notes button
        const refreshBtn = this.container.querySelector('#refresh-notes-btn');
        refreshBtn?.addEventListener('click', () => this.manualRefresh());

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
        const noteText = this.container.querySelector('#note-text');
        const selectedColor = this.container.querySelector('input[name="note-color"]:checked');
        const saveBtn = this.container.querySelector('#save-note-btn');
        
        if (!noteText?.value.trim()) {
            this.showError('Please enter a note');
            return;
        }

        if (!saveBtn) {
            console.error('Save button not found');
            return;
        }

        const noteData = {
            note: noteText.value.trim(),
            color: parseInt(selectedColor?.value || '1'),
            user: this.currentUser
        };

        // Store original button state
        const originalHTML = saveBtn.innerHTML;
        const originalDisabled = saveBtn.disabled;

        // Show saving state
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        try {
            const result = await this.notesAPI.createNote(noteData);
            
            // Success path - reset button and hide form
            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = originalDisabled;
            
            this.showSuccess('Note saved successfully!');
            this.hideAddForm();
            
            // Refresh notes after save
            try {
                await this.loadNotes();
            } catch (refreshError) {
                console.error('Failed to refresh after save:', refreshError);
                // Don't show error to user - save was successful
            }

        } catch (error) {
            console.error('Failed to save note:', error);
            
            // Error path - reset button but keep form open
            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = originalDisabled;
            
            this.showError(`Failed to save note: ${error.message}`);
        }
    }

    async loadNotes() {
        const notesList = this.container.querySelector('#notes-list');
        
        try {
            if (notesList) {
                notesList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading notes...</div>';
            }

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
            });
            
            this.notes = await Promise.race([
                this.notesAPI.getAllNotes(),
                timeoutPromise
            ]);
            
            this.renderNotes();

        } catch (error) {
            console.error('Failed to load notes:', error);
            
            // Show error in the notes list area
            if (notesList) {
                this.renderErrorState(error.message);
            }
            
            // Don't show notification error for background refreshes
            // Only show if this is the initial load or manual refresh
            if (!this.notes || this.notes.length === 0) {
                this.showError(`Failed to load notes: ${error.message}`);
            }
        }
    }

    // Manual refresh method with visual feedback
    async manualRefresh() {
        const refreshBtn = this.container.querySelector('#refresh-notes-btn');
        const originalContent = refreshBtn?.innerHTML;
        
        try {
            // Show spinning icon
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                refreshBtn.disabled = true;
            }
            
            await this.loadNotes();
            this.showSuccess('Notes refreshed!');
        } catch (error) {
            console.error('Manual refresh failed:', error);
            this.showError('Failed to refresh notes');
        } finally {
            // Restore button
            if (refreshBtn) {
                refreshBtn.innerHTML = originalContent || '<i class="fas fa-sync-alt"></i>';
                refreshBtn.disabled = false;
            }
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

    renderErrorState(errorMessage) {
        const notesList = this.container.querySelector('#notes-list');
        if (notesList) {
            notesList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load notes</p>
                    <small>${errorMessage}</small>
                    <button class="btn btn-primary" onclick="this.closest('.notes-widget').querySelector('#refresh-notes-btn').click()">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        const noteElement = this.container.querySelector(`[data-note-id="${noteId}"]`);
        const originalOpacity = noteElement?.style.opacity || '1';
        const originalPointerEvents = noteElement?.style.pointerEvents || 'auto';

        try {
            // Show loading state for the specific note
            if (noteElement) {
                noteElement.style.opacity = '0.5';
                noteElement.style.pointerEvents = 'none';
            }

            await this.notesAPI.deleteNote(noteId);
            
            // Show success message immediately
            this.showSuccess('Note deleted successfully!');
            
            // Refresh notes after delete
            try {
                await this.loadNotes();
            } catch (refreshError) {
                console.error('Failed to refresh after delete:', refreshError);
                // If refresh fails, just remove the note element manually
                if (noteElement) {
                    noteElement.remove();
                }
            }

        } catch (error) {
            console.error('Failed to delete note:', error);
            this.showError(`Failed to delete note: ${error.message}`);
            
            // Always restore note element if deletion failed
            if (noteElement) {
                noteElement.style.opacity = originalOpacity;
                noteElement.style.pointerEvents = originalPointerEvents;
            }
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

    // Public method to refresh notes (can be called from other components)
    async refresh() {
        await this.loadNotes();
    }
}

// Export for use in other modules
window.NotesWidget = NotesWidget;
