# Personal Dashboard

A customizable personal dashboard with FotMob-inspired dark theme.

## Features

- **3 Customizable Panels**: Projects, Today's Focus, and Life Stuff
- **Widget Management**: Add, remove, and customize widgets with titles, content, and colors
- **Panel Customization**: Change panel names and configurations
- **Persistent Storage**: Settings saved to MySQL database via XAMPP
- **Dark Theme**: FotMob-inspired color scheme with green accents

## Prerequisites

1. **Node.js** (v14 or higher)
2. **XAMPP** (for MySQL database)

## Setup Instructions

### 1. Database Setup (XAMPP)

1. Install and start XAMPP
2. Start Apache and MySQL services in XAMPP Control Panel
3. The application will automatically create the `dashboard_db` database and required tables

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend API will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3067`

## API Endpoints

- `GET /api/panels` - Get all panels and widgets
- `POST /api/panels` - Save panels configuration
- `GET /api/panels/:panelKey` - Get specific panel
- `GET /api/health` - Health check

## Usage

1. Open `http://localhost:3067` in your browser
2. Click the settings icon (⚙️) on any panel header
3. Customize panel name and widgets:
   - Add new widgets with title, color, and content
   - Remove existing widgets
   - Change panel names
4. Click "Save Changes" to persist to database

## File Structure

```
frontend/
├── home.html          # Main dashboard page
├── style.css          # FotMob-inspired styles
├── dashboard.js       # Dashboard functionality and API calls
├── server.js          # Frontend Express server
└── package.json

backend/
├── server.js          # Backend API server
├── package.json
└── .env               # Database configuration
```

## Default Panels

- **Left Panel (My Projects)**: Current Work, Side Projects, Ideas & Notes, Learning Goals
- **Center Panel (Today's Focus)**: Priority Tasks, Deadlines, Quick Notes, Weekly Progress  
- **Right Panel (Life Stuff)**: Calendar, Reminders, Habits Tracker, Random Thoughts

## Customization

- All colors, titles, and content can be customized through the settings UI
- Widget layout automatically adapts (large widgets, small widgets in rows)
- Settings persist across browser sessions via MySQL database
