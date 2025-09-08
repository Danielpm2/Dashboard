const express = require('express');
require('dotenv').config();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('./api/notes.js');

// Import new routes
const calendarRoutes = require('./api/calendar');
const authRoutes = require('./api/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'unknown origin'}`);
    next();
});

// CORS middleware for frontend communication
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3067', 'http://127.0.0.1:3067', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
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

// Calendar API routes
app.use('/api/calendar', calendarRoutes);

// Auth API routes
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});