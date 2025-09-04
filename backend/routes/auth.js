const express = require('express');
const router = express.Router();
const googleCalendarService = require('../api/GoogleCalendarService');

// Google OAuth2 authentication routes

// Start OAuth2 flow
router.get('/google', (req, res) => {
    try {
        const authUrl = googleCalendarService.getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error('Error starting Google auth:', error);
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
        
        if (!code) {
            return res.status(400).json({ 
                success: false, 
                error: 'No authorization code received' 
            });
        }

        const tokens = await googleCalendarService.setCredentials(code);
        console.log('OAuth2 authentication successful');
        
        // Redirect back to dashboard with success message
        res.redirect('http://localhost:3067/?auth=success');
        
    } catch (error) {
        console.error('Error in Google auth callback:', error);
        res.redirect('http://localhost:3067/?auth=error');
    }
});

// Check authentication status
router.get('/status', (req, res) => {
    const isAuthenticated = googleCalendarService.isAuthenticated();
    res.json({ 
        authenticated: isAuthenticated,
        message: isAuthenticated ? 'User is authenticated' : 'User needs to authenticate'
    });
});

// Logout (clear credentials)
router.post('/logout', (req, res) => {
    try {
        // Clear the OAuth2 credentials and stored file
        googleCalendarService.clearStoredCredentials();
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to logout' 
        });
    }
});

module.exports = router;
