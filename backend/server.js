const express = require('express');
require('dotenv').config();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('./api/notes.js')

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend communication
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'Dashboard API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Notes API routes
app.get('/api/notes', getNotes);
app.get('/api/notes/:id', getNote);
app.post('/api/notes', createNote);
app.put('/api/notes/:id', updateNote);
app.delete('/api/notes/:id', deleteNote);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});