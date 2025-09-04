const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Default XAMPP password is empty
    database: 'dashboard_db'
};

// Initialize database
async function initDatabase() {
    try {
        // Connect without database first
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS dashboard_db');
        await connection.end();

        // Connect to the database
        const db = await mysql.createConnection(dbConfig);

        // Create tables
        await db.execute(`
            CREATE TABLE IF NOT EXISTS panels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                panel_key VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS widgets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                widget_id BIGINT NOT NULL,
                panel_key VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                color VARCHAR(7) DEFAULT '#00d563',
                widget_order INT DEFAULT 0,
                is_large BOOLEAN DEFAULT FALSE,
                is_small BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (panel_key) REFERENCES panels(panel_key) ON DELETE CASCADE
            )
        `);

        console.log('Database initialized successfully');
        await db.end();
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// API Routes

// Get all panels with widgets
app.get('/api/panels', async (req, res) => {
    try {
        const db = await mysql.createConnection(dbConfig);
        
        // Get panels
        const [panels] = await db.execute('SELECT * FROM panels ORDER BY panel_key');
        
        // Get widgets for each panel
        const result = {};
        
        for (const panel of panels) {
            const [widgets] = await db.execute(
                'SELECT * FROM widgets WHERE panel_key = ? ORDER BY widget_order',
                [panel.panel_key]
            );
            
            result[panel.panel_key] = {
                title: panel.title,
                widgets: widgets.map(widget => ({
                    id: widget.widget_id,
                    title: widget.title,
                    content: widget.content,
                    color: widget.color,
                    large: widget.is_large,
                    small: widget.is_small
                }))
            };
        }
        
        await db.end();
        res.json({ panels: result });
    } catch (error) {
        console.error('Error fetching panels:', error);
        res.status(500).json({ error: 'Failed to fetch panels' });
    }
});

// Save panels configuration
app.post('/api/panels', async (req, res) => {
    try {
        const { panels } = req.body;
        const db = await mysql.createConnection(dbConfig);
        
        await db.execute('START TRANSACTION');
        
        // Clear existing data
        await db.execute('DELETE FROM widgets');
        await db.execute('DELETE FROM panels');
        
        // Insert panels and widgets
        for (const [panelKey, panelData] of Object.entries(panels)) {
            // Insert panel
            await db.execute(
                'INSERT INTO panels (panel_key, title) VALUES (?, ?)',
                [panelKey, panelData.title]
            );
            
            // Insert widgets
            for (let i = 0; i < panelData.widgets.length; i++) {
                const widget = panelData.widgets[i];
                await db.execute(
                    `INSERT INTO widgets 
                     (widget_id, panel_key, title, content, color, widget_order, is_large, is_small) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        widget.id,
                        panelKey,
                        widget.title,
                        widget.content || '',
                        widget.color || '#00d563',
                        i,
                        widget.large || false,
                        widget.small || false
                    ]
                );
            }
        }
        
        await db.execute('COMMIT');
        await db.end();
        
        res.json({ success: true, message: 'Panels saved successfully' });
    } catch (error) {
        console.error('Error saving panels:', error);
        res.status(500).json({ error: 'Failed to save panels' });
    }
});

// Get specific panel
app.get('/api/panels/:panelKey', async (req, res) => {
    try {
        const { panelKey } = req.params;
        const db = await mysql.createConnection(dbConfig);
        
        const [panels] = await db.execute(
            'SELECT * FROM panels WHERE panel_key = ?',
            [panelKey]
        );
        
        if (panels.length === 0) {
            await db.end();
            return res.status(404).json({ error: 'Panel not found' });
        }
        
        const [widgets] = await db.execute(
            'SELECT * FROM widgets WHERE panel_key = ? ORDER BY widget_order',
            [panelKey]
        );
        
        const result = {
            title: panels[0].title,
            widgets: widgets.map(widget => ({
                id: widget.widget_id,
                title: widget.title,
                content: widget.content,
                color: widget.color,
                large: widget.is_large,
                small: widget.is_small
            }))
        };
        
        await db.end();
        res.json(result);
    } catch (error) {
        console.error('Error fetching panel:', error);
        res.status(500).json({ error: 'Failed to fetch panel' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Dashboard API is running' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Dashboard API server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    
    // Initialize database
    await initDatabase();
});

module.exports = app;
