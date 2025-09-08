# Google Calendar Integration Setup

This dashboard now includes full Google Calendar integration with the following features:

## Features
- **Calendar Widget**: Monthly calendar view showing events on their respective days
- **Events List Widget**: List view of upcoming events with different time filters
- **Event Management**: Add, edit, and delete events directly from the dashboard
- **OAuth2 Authentication**: Secure Google account integration

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted
4. Select "Web application" as the application type
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - Add production URLs when deploying
6. Download the credentials JSON file

### 3. Backend Configuration

1. Copy the credentials file to `backend/config/google-credentials.json`
2. Or copy from the example:
   ```bash
   cp backend/config/google-credentials.json.example backend/config/google-credentials.json
   ```
3. Update the file with your actual Google OAuth credentials

### 4. Environment Variables (Optional)

Create a `.env` file in the backend directory:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 5. Start the Services

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

## Widget Usage

### Calendar Widget
- **Monthly View**: Navigate between months using arrow buttons
- **Event Display**: See events as colored blocks on calendar days
- **Authentication**: Click "Sign In" to connect your Google account
- **Add Events**: Click "+" or click on a day to add new events
- **Edit Events**: Click on existing events to edit or delete them

### Events List Widget
- **View Modes**: Switch between "Upcoming", "Today", and "This Week"
- **Quick Add**: Use the "+" button for quick event creation
- **Event Management**: Click on events to edit, use action buttons to delete
- **Status Indicators**: See ongoing events with "Now" badges

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Sign out user

### Calendar Events
- `GET /api/calendar/events` - Get events with optional filters
- `GET /api/calendar/events/today` - Get today's events
- `GET /api/calendar/events/upcoming` - Get upcoming events
- `POST /api/calendar/events` - Create new event
- `PUT /api/calendar/events/:id` - Update existing event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/test` - Test calendar connection

## Security Features

- **OAuth2 Flow**: Secure Google account integration
- **Token Management**: Automatic token refresh
- **Error Handling**: Comprehensive error handling with fallbacks
- **Input Validation**: All event data is validated
- **HTML Escaping**: XSS protection for event content

## Troubleshooting

### Common Issues

1. **"Not authenticated" errors**
   - Make sure you've signed in via the widget
   - Check if credentials are properly configured
   - Verify redirect URIs match in Google Console

2. **"Invalid credentials" errors**
   - Double-check the google-credentials.json file
   - Ensure the project has Calendar API enabled
   - Verify OAuth consent screen is configured

3. **Events not loading**
   - Check browser console for JavaScript errors
   - Verify backend server is running on port 3000
   - Check network tab for API call failures

### Mock Data Mode

If credentials aren't configured, the system will use mock data for development:
- Sample events will be displayed
- All CRUD operations will work with mock data
- Perfect for testing UI without Google setup

## Development Notes

### File Structure
```
backend/
├── api/
│   ├── auth.js              # OAuth authentication routes
│   ├── calendar.js          # Calendar API routes
│   └── GoogleCalendarService.js  # Core calendar service
├── config/
│   └── google-credentials.json   # OAuth credentials
└── server.js                # Main server with routes

frontend/
├── js/
│   ├── calendar-api.js      # Frontend API client
│   ├── calendar-widget.js   # Calendar widget
│   └── events-widget.js     # Events list widget
└── styles/
    └── components.css       # Calendar widget styles
```

### Key Components

- **GoogleCalendarService**: Handles all Google API interactions
- **CalendarAPI**: Frontend service for API communication
- **CalendarWidget**: Monthly calendar with event management
- **EventsWidget**: List view with filtering and quick actions

## Future Enhancements

- Multiple calendar support
- Recurring event creation
- Event categories and colors
- Calendar sync indicators
- Offline mode with sync
- Email notifications
- Event reminders
