const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class OAuth2Manager {
    constructor() {
        this.credentialsPath = path.join(__dirname, '..', 'config', 'google-credentials.json');
        this.oauth2Client = null;
        this.initializeOAuth2();
    }

    initializeOAuth2() {
        try {
            console.log('Initializing Google Calendar OAuth2...');
            
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'http://localhost:3000/api/auth/google/callback'
            );

            // Load stored credentials on startup
            this.loadStoredCredentials();

        } catch (error) {
            console.error('Failed to initialize OAuth2:', error);
        }
    }

    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    async setCredentials(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            await this.saveCredentials(tokens);
            
            console.log('Google Calendar credentials set and saved successfully');
            return tokens;
        } catch (error) {
            console.error('Error setting credentials:', error);
            throw error;
        }
    }

    async saveCredentials(tokens) {
        try {
            const credentialsDir = path.dirname(this.credentialsPath);
            if (!fs.existsSync(credentialsDir)) {
                fs.mkdirSync(credentialsDir, { recursive: true });
            }
            
            const credentialsData = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
                token_type: tokens.token_type,
                expiry_date: tokens.expiry_date,
                saved_at: new Date().toISOString()
            };
            
            fs.writeFileSync(this.credentialsPath, JSON.stringify(credentialsData, null, 2));
            console.log('Credentials saved to file successfully');
        } catch (error) {
            console.error('Error saving credentials to file:', error);
        }
    }

    loadStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                const credentialsData = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
                
                if (credentialsData.refresh_token) {
                    this.oauth2Client.setCredentials({
                        access_token: credentialsData.access_token,
                        refresh_token: credentialsData.refresh_token,
                        scope: credentialsData.scope,
                        token_type: credentialsData.token_type,
                        expiry_date: credentialsData.expiry_date
                    });
                    console.log('Stored Google Calendar credentials loaded successfully');
                    return true;
                }
            }
            console.log('No stored credentials found');
            return false;
        } catch (error) {
            console.error('Error loading stored credentials:', error);
            return false;
        }
    }

    clearStoredCredentials() {
        try {
            if (fs.existsSync(this.credentialsPath)) {
                fs.unlinkSync(this.credentialsPath);
                console.log('Stored credentials cleared');
            }
            this.oauth2Client.setCredentials({});
        } catch (error) {
            console.error('Error clearing stored credentials:', error);
        }
    }

    isAuthenticated() {
        return this.oauth2Client && this.oauth2Client.credentials && 
               (this.oauth2Client.credentials.access_token || this.oauth2Client.credentials.refresh_token);
    }

    getOAuth2Client() {
        return this.oauth2Client;
    }
}

module.exports = OAuth2Manager;
