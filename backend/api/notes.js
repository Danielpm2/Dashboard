const db = require('../db.js');

function getNotes(req, res) {
    // Logic to fetch notes from the database

    db.query('SELECT * FROM notes', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });

}

function createNote(req, res) {
    // Logic to create a new note in the database

    db.query('INSERT INTO notes (note, color, user) VALUES (?, ?, ?)', [req.body.note, req.body.color, req.body.user], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
}

function updateNote(req, res) {
    // Logic to update an existing note in the database
}

function deleteNote(req, res) {
    // Logic to delete a note from the database
}

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
};
