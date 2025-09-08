const db = require('../db.js');

async function getNotes(req, res) { //get 
    // Logic to fetch notes from the database
    try {
        console.log('📋 Fetching all notes...');
        
        const results = await db.query('SELECT * FROM notes ORDER BY time DESC');
        
        console.log('✅ Found', results.length, 'notes');
        
        res.json(results);
    } catch (err) {
        console.error('❌ Database error fetching notes:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function getNote(req, res) { //get
    // Logic to fetch a single note by ID from the database
    try {
        const noteId = parseInt(req.params.id);
        
        if (!noteId || noteId <= 0) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        console.log('📋 Fetching note:', noteId);
        
        const results = await db.query('SELECT * FROM notes WHERE id = ?', [noteId]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        console.log('✅ Note found');
        
        res.json(results[0]);
    } catch (err) {
        console.error('❌ Database error fetching note:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function createNote(req, res) { //post
    // Logic to create a new note in the database
    try {
        // Validate required fields
        if (!req.body.note || !req.body.color || !req.body.user) {
            return res.status(400).json({ error: 'Missing required fields: note, color, user' });
        }

        console.log('📝 Creating note:', req.body);
        
        const results = await db.query('INSERT INTO notes (note, color, user) VALUES (?, ?, ?)', [req.body.note, req.body.color, req.body.user]);
        
        console.log('✅ Note created with ID:', results.insertId);
        
        res.status(201).json({ id: results.insertId, ...req.body });
    } catch (err) {
        console.error('❌ Database error creating note:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function updateNote(req, res) { //put
    // Logic to update an existing note in the database
    try {
        const noteId = parseInt(req.params.id);
        
        if (!noteId || noteId <= 0) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        if (!req.body.note || !req.body.color || !req.body.user) {
            return res.status(400).json({ error: 'Missing required fields: note, color, user' });
        }

        console.log('✏️ Updating note:', noteId, req.body);
        
        const results = await db.query('UPDATE notes SET note = ?, color = ?, user = ? WHERE id = ?', [req.body.note, req.body.color, req.body.user, noteId]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        console.log('✅ Note updated successfully');
        
        res.json({ id: noteId, ...req.body });
    } catch (err) {
        console.error('❌ Database error updating note:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function deleteNote(req, res) { //delete
    // Logic to delete a note from the database
    try {
        const noteId = parseInt(req.params.id);
        
        if (!noteId || noteId <= 0) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        console.log('🗑️ Deleting note:', noteId);
        
        const results = await db.query('DELETE FROM notes WHERE id = ?', [noteId]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        console.log('✅ Note deleted successfully');
        
        res.json({ id: noteId, message: 'Note deleted successfully' });
    } catch (err) {
        console.error('❌ Database error deleting note:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
};
