const mysql = require('mysql2/promise');
const config = require('./config');

// Database connection configuration
const dbConfig = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name
};

// Initialize database and create tables
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

// Get database connection
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

module.exports = {
    initDatabase,
    getConnection,
    dbConfig
};
