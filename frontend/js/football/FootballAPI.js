// Football API service - Frontend client that connects to backend
class FootballAPI {
    constructor() {
        this.backendUrl = 'http://localhost:3000/api/football';
    }

    async makeRequest(endpoint) {
        try {
            const response = await fetch(`${this.backendUrl}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Request failed');
            }

            return result.data;
        } catch (error) {
            console.error('Football API request failed:', error);
            throw error;
        }
    }

    async getAllFootballData() {
        try {
            return await this.makeRequest('/all');
        } catch (error) {
            console.error('Error fetching all football data:', error);
            throw error;
        }
    }

    async getBarcelonaInfo() {
        try {
            return await this.makeRequest('/team');
        } catch (error) {
            console.error('Error fetching Barcelona info:', error);
            throw error;
        }
    }

    async getBarcelonaFixtures(next = 5) {
        try {
            return await this.makeRequest(`/fixtures?next=${next}`);
        } catch (error) {
            console.error('Error fetching Barcelona fixtures:', error);
            throw error;
        }
    }

    async getBarcelonaLastResults(last = 3) {
        try {
            return await this.makeRequest(`/results?last=${last}`);
        } catch (error) {
            console.error('Error fetching Barcelona results:', error);
            throw error;
        }
    }

    async getLamineYamalStats() {
        try {
            return await this.makeRequest('/player/lamine-yamal');
        } catch (error) {
            console.error('Error fetching Lamine Yamal stats:', error);
            throw error;
        }
    }

    async getLeagueStandings() {
        try {
            return await this.makeRequest('/standings');
        } catch (error) {
            console.error('Error fetching league standings:', error);
            throw error;
        }
    }
}

export default FootballAPI;
