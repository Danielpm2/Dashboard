const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3067;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`running at http://localhost:${PORT}`);
    console.log(`Serving from: ${__dirname}`);
});
