const express = require('express');
require('dotenv').config();
const {getNotes} = require('./api/notes.js')

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'Dashboard API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Notes API routes
app.get('/api/notes', getNotes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});