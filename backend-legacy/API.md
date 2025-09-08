# Dashboard API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### GET /api/health
Health check endpoint to verify API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Dashboard API is running"
}
```

### GET /api/panels
Get all panels with their widgets.

**Response:**
```json
{
  "panels": {
    "left": {
      "title": "My Projects",
      "widgets": [
        {
          "id": 1,
          "title": "Current Work",
          "content": "",
          "color": "#00d563",
          "large": false,
          "small": false
        }
      ]
    },
    "center": {
      "title": "Today's Focus", 
      "widgets": [...]
    },
    "right": {
      "title": "Life Stuff",
      "widgets": [...]
    }
  }
}
```

### POST /api/panels
Save the complete panels configuration.

**Request Body:**
```json
{
  "panels": {
    "left": {
      "title": "My Projects",
      "widgets": [
        {
          "id": 1,
          "title": "Current Work",
          "content": "Working on dashboard project",
          "color": "#00d563"
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Panels saved successfully"
}
```

### GET /api/panels/:panelKey
Get a specific panel by key (left, center, right).

**Parameters:**
- `panelKey`: Panel identifier (left, center, right)

**Response:**
```json
{
  "title": "My Projects",
  "widgets": [
    {
      "id": 1,
      "title": "Current Work", 
      "content": "",
      "color": "#00d563",
      "large": false,
      "small": false
    }
  ]
}
```

## Database Schema

### panels table
- `id`: Auto-increment primary key
- `panel_key`: Unique panel identifier (left, center, right)
- `title`: Panel display name
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### widgets table
- `id`: Auto-increment primary key
- `widget_id`: Widget identifier from frontend
- `panel_key`: Foreign key to panels table
- `title`: Widget title
- `content`: Widget content (TEXT)
- `color`: Widget color (HEX code)
- `widget_order`: Display order within panel
- `is_large`: Boolean for large widget display
- `is_small`: Boolean for small widget display
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `404`: Resource not found
- `500`: Internal server error

Error response format:
```json
{
  "error": "Error message description"
}
```
