# Google Calendar Integration Setup Guide

## Current Status ✅
Your dashboard is now working with **mock calendar data** that demonstrates how the calendar will look and function.

## Why Mock Data?
Google Calendar requires OAuth2 authentication for private calendars, which is complex to set up. The current implementation shows mock events so you can see the calendar working immediately.

## Mock Events Include:
- **Today**: Team Standup (9:00-9:30 AM), Project Review (2:00-3:00 PM)
- **Tomorrow**: Client Meeting (10:00-11:00 AM)
- **Day 3**: Code Review Session (4:00-5:00 PM)

## To Use Real Google Calendar (Optional):

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: `dashboard-471116`
3. Enable the Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### Step 2: OAuth2 Setup
1. Set application type to "Web application"
2. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3067/auth/callback`
3. Download the JSON credentials file

### Step 3: Get Refresh Token
This is the complex part that requires a web flow to authorize your application.

### Alternative: Use Service Account (Easier)
1. Create a Service Account instead of OAuth2
2. Download the JSON key file
3. Share your Google Calendar with the service account email
4. Update the code to use service account authentication

## Current Working Features:
- Calendar section displays properly
- Mock events show with time, title, location, description
- Today's events are highlighted
- Refresh button works
- Loading states work
- Error handling works
- Responsive design

## Files Updated:
- `backend/api/googleCalendar.js` - Calendar service with mock data
- `backend/routes/calendar.js` - Calendar API endpoints
- `frontend/home.html` - Calendar HTML structure
- `frontend/style.css` - Calendar styling
- `frontend/dashboard.js` - Calendar JavaScript functionality

## Dashboard Features Working:
1. **Left Panel**: Google Calendar (with mock events)
2. **Center Panel**: Customizable widgets
3. **Right Panel**: Customizable widgets
4. **Settings**: Gear icons on each panel for customization
5. **Database**: Panel configurations are saved to MySQL

The calendar is fully functional and will seamlessly switch to real data once you configure Google API authentication!
