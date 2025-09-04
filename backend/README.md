# Backend Structure Documentation

## Overview
The backend has been reorganized into a modular structure following Node.js/Express best practices.

## Directory Structure

```
backend/
├── api/
│   ├── config.js          # Centralized configuration
│   ├── database.js        # Database connection and initialization
│   └── middleware.js      # Custom middleware functions
├── routes/
│   ├── index.js          # Central route index
│   ├── panels.js         # Panel-related routes
│   └── health.js         # Health check routes
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables
```

## File Descriptions

### `/api/config.js`
Centralized configuration management that reads from environment variables and provides defaults.

**Features:**
- Server configuration (port, host, environment)
- Database configuration
- CORS settings
- API settings
- Logging configuration

### `/api/database.js`
Database connection management and initialization.

**Exports:**
- `initDatabase()` - Creates database and tables
- `getConnection()` - Returns a MySQL connection
- `dbConfig` - Database configuration object

### `/api/middleware.js`
Custom middleware functions.

**Includes:**
- CORS configuration
- Error handling middleware
- Request logging middleware
- JSON parser with validation

### `/routes/index.js`
Central route registry that mounts all route modules.

**Features:**
- Mounts all sub-routes
- Provides API documentation endpoint
- Lists all available endpoints

### `/routes/panels.js`
Panel-related API endpoints.

**Endpoints:**
- `GET /` - Get all panels with widgets
- `POST /` - Save panels configuration
- `GET /:panelKey` - Get specific panel

### `/routes/health.js`
Health check endpoints.

**Endpoints:**
- `GET /` - Basic health check
- `GET /detailed` - Detailed health check with database status

### `/server.js`
Main server file - now clean and focused.

**Responsibilities:**
- Server setup and configuration
- Middleware registration
- Route mounting
- Error handling
- Server startup

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info and available endpoints |
| GET | `/api` | API documentation |
| GET | `/api/health` | Basic health check |
| GET | `/api/health/detailed` | Detailed health with database status |
| GET | `/api/panels` | Get all panels with widgets |
| POST | `/api/panels` | Save panels configuration |
| GET | `/api/panels/:panelKey` | Get specific panel |

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dashboard_db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3067,http://127.0.0.1:3067

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

## Benefits of This Structure

1. **Modularity** - Each component has a single responsibility
2. **Maintainability** - Easy to find and modify specific functionality
3. **Scalability** - Easy to add new routes and middleware
4. **Testability** - Each module can be tested independently
5. **Configuration** - Centralized configuration management
6. **Error Handling** - Consistent error handling across all routes
7. **Logging** - Centralized request logging
8. **Documentation** - Self-documenting API endpoints

## Adding New Routes

1. Create a new file in `/routes/` directory
2. Export an Express router from the file
3. Import and mount it in `/routes/index.js`

Example:
```javascript
// routes/newfeature.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'New feature endpoint' });
});

module.exports = router;

// routes/index.js
const newFeatureRoutes = require('./newfeature');
router.use('/newfeature', newFeatureRoutes);
```

## Development vs Production

The configuration system supports different environments:
- Set `NODE_ENV=production` for production
- Different logging levels and configurations
- Environment-specific database connections
