/**
 * Notes API Client
 * Handles all communication with the backend notes API
 */

class NotesAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    // GET all notes
    async getAllNotes() {
        try {
            console.log('📡 Fetching all notes from:', `${this.baseURL}/notes`);
            
            const response = await fetch(`${this.baseURL}/notes`);
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const notes = await response.json();
            console.log('📡 Fetched notes:', notes);
            return notes;
        } catch (error) {
            console.error('❌ Error fetching notes:', error);
            
            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running on port 3000.');
            }
            throw new Error('Failed to fetch notes');
        }
    }

    // GET single note by ID
    async getNote(id) {
        try {
            const noteId = parseInt(id);
            if (isNaN(noteId) || noteId <= 0) {
                throw new Error('Invalid note ID');
            }

            const response = await fetch(`${this.baseURL}/notes/${noteId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Note not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching note:', error);
            throw error;
        }
    }

    // POST create new note
    async createNote(noteData) {
        try {
            const sanitizedData = this.validateAndSanitizeNoteData(noteData);
            
            console.log('📡 Making API request to create note:', sanitizedData);

            const response = await fetch(`${this.baseURL}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedData)
            });

            console.log('📡 API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📡 API Response data:', result);
            return result;
        } catch (error) {
            console.error('❌ API Error creating note:', error);
            
            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    // PUT update note
    async updateNote(id, noteData) {
        try {
            const noteId = parseInt(id);
            if (isNaN(noteId) || noteId <= 0) {
                throw new Error('Invalid note ID');
            }

            const sanitizedData = this.validateAndSanitizeNoteData(noteData);

            const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 404) {
                    throw new Error('Note not found');
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    // DELETE note
    async deleteNote(id) {
        try {
            const noteId = parseInt(id);
            if (isNaN(noteId) || noteId <= 0) {
                throw new Error('Invalid note ID');
            }

            const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 404) {
                    throw new Error('Note not found');
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    // Input validation and sanitization
    validateAndSanitizeNoteData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid note data');
        }

        // Validate and sanitize note content
        if (!data.note || typeof data.note !== 'string') {
            throw new Error('Note content is required and must be a string');
        }
        const note = data.note.trim();
        if (note.length === 0) {
            throw new Error('Note content cannot be empty');
        }
        if (note.length > 1000) {
            throw new Error('Note content is too long (max 1000 characters)');
        }

        // Validate color
        const color = parseInt(data.color);
        if (isNaN(color) || color < 0 || color > 10) {
            throw new Error('Color must be a number between 0 and 10');
        }

        // Validate user
        const user = parseInt(data.user);
        if (isNaN(user) || user <= 0) {
            throw new Error('Valid user ID is required');
        }

        return {
            note: note,
            color: color,
            user: user
        };
    }

    // Utility method to escape HTML (prevent XSS)
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Export for use in other modules
window.NotesAPI = NotesAPI;
