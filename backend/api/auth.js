const express = require('express');
const router = express.Router();
const googleCalendarService = require('../api/GoogleCalendarService');

// Google OAuth2 authentication routes

// Start OAuth2 flow
router.get('/google', (req, res) => {
    try {
        console.log('🔑 Starting Google OAuth2 flow');
        const authUrl = googleCalendarService.getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error('❌ Error starting Google auth:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to start authentication' 
        });
    }
});

// OAuth2 callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        console.log('🔑 Processing Google OAuth2 callback');
        
        if (!code) {
            console.error('❌ No authorization code received');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3067'}?auth=error&message=no_code`);
        }

        const tokens = await googleCalendarService.setCredentials(code);
        console.log('✅ OAuth2 authentication successful');
        
        // Redirect back to dashboard with success message
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3067'}?auth=success`);
        
    } catch (error) {
        console.error('❌ Error in Google auth callback:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3067'}?auth=error&message=auth_failed`);
    }
});

// Check authentication status
router.get('/status', (req, res) => {
    try {
        const isAuthenticated = googleCalendarService.isAuthenticated();
        console.log(`🔑 Auth status check: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
        
        res.json({ 
            success: true,
            authenticated: isAuthenticated,
            message: isAuthenticated ? 'User is authenticated' : 'User needs to authenticate',
            authUrl: isAuthenticated ? null : '/api/auth/google'
        });
    } catch (error) {
        console.error('❌ Error checking auth status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Logout (clear credentials)
router.post('/logout', (req, res) => {
    try {
        console.log('🔑 Logging out user');
        googleCalendarService.clearStoredCredentials();
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('❌ Error during logout:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to logout' 
        });
    }
});

// Get user info (if authenticated)
router.get('/user', async (req, res) => {
    try {
        if (!googleCalendarService.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                authenticated: false,
                message: 'Not authenticated'
            });
        }

        // Could expand this to get user profile info from Google API
        res.json({
            success: true,
            authenticated: true,
            message: 'User authenticated',
            // user: userInfo // Could add actual user data here
        });
        
    } catch (error) {
        console.error('❌ Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
