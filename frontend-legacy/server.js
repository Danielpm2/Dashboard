const express = require('express');
const path = require('path');

const app = express();
const PORT = 3067;

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(__dirname));

// Route for the main dashboard page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Dashboard server running at http://localhost:${PORT}`);
});
