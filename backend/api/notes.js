const db = require('../db.js');

function getNotes(req, res) { //get 
    // Logic to fetch notes from the database

    db.query('SELECT * FROM notes', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

function getNote(req, res) { //get
    // Logic to fetch a single note by ID from the database

    const noteId = req.params.id;
    db.query('SELECT * FROM notes WHERE id = ?', [noteId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]); //first value that has that id
    });
}

function createNote(req, res) { //post
    // Logic to create a new note in the database

    db.query('INSERT INTO notes (note, color, user) VALUES (?, ?, ?)', [req.body.note, req.body.color, req.body.user], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
}

function updateNote(req, res) { //post
    // Logic to update an existing note in the database

    const noteId = req.params.id;
    db.query('UPDATE notes SET note = ?, color = ?, user = ? WHERE id = ?', [req.body.note, req.body.color, req.body.user, noteId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: noteId, ...req.body });
    });
}

function deleteNote(req, res) { //post
    // Logic to delete a note from the database

    const noteId = req.params.id;
    db.query('DELETE FROM notes WHERE id = ?', [noteId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: noteId });
    });
}

module.exports = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
};
