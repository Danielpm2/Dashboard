const axios = require('axios');

class FootballService {
    constructor() {
        this.apiKey = process.env.FOOTBALL_API_KEY;
        this.baseUrl = process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';
        this.barcelonaTeamId = process.env.BARCELONA_TEAM_ID || 529;
        this.lamineYamalPlayerId = process.env.LAMINE_YAMAL_PLAYER_ID || 276158;
        this.laLigaId = process.env.LA_LIGA_ID || 140;
    }

    async makeRequest(endpoint) {
        // Check if we have a valid API key
        if (!this.apiKey || this.apiKey === 'your_football_api_key_here') {
            console.log('Using mock data for football API - no valid API key');
            return this.getMockDataForEndpoint(endpoint);
        }

        console.log(`Making real API request to: ${this.baseUrl}${endpoint}`);
        
        try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io'
                }
            });

            console.log('API request successful, using real data');
            return response.data;
        } catch (error) {
            console.error('Football API request failed:', error.message);
            console.log('Falling back to mock data');
            return this.getMockDataForEndpoint(endpoint);
        }
    }

    async getBarcelonaInfo() {
        try {
            const data = await this.makeRequest(`/teams?id=${this.barcelonaTeamId}`);
            return data.response?.[0] || this.getMockBarcelonaInfo();
        } catch (error) {
            console.error('Error fetching Barcelona info:', error);
            return this.getMockBarcelonaInfo();
        }
    }

    async getBarcelonaFixtures(next = 5) {
        try {
            const data = await this.makeRequest(`/fixtures?team=${this.barcelonaTeamId}&next=${next}`);
            return data.response || this.getMockFixtures();
        } catch (error) {
            console.error('Error fetching Barcelona fixtures:', error);
            return this.getMockFixtures();
        }
    }

    async getBarcelonaLastResults(last = 3) {
        try {
            const data = await this.makeRequest(`/fixtures?team=${this.barcelonaTeamId}&last=${last}`);
            return data.response || this.getMockResults();
        } catch (error) {
            console.error('Error fetching Barcelona results:', error);
            return this.getMockResults();
        }
    }

    async getLamineYamalStats() {
        try {
            const currentSeason = new Date().getFullYear();
            const data = await this.makeRequest(`/players?id=${this.lamineYamalPlayerId}&season=${currentSeason}`);
            return data.response?.[0] || this.getMockPlayerStats();
        } catch (error) {
            console.error('Error fetching Lamine Yamal stats:', error);
            return this.getMockPlayerStats();
        }
    }

    async getLeagueStandings() {
        try {
            const currentSeason = new Date().getFullYear();
            const data = await this.makeRequest(`/standings?league=${this.laLigaId}&season=${currentSeason}`);
            
            // Find Barcelona's position
            const standings = data.response?.[0]?.league?.standings?.[0] || [];
            const barcelonaStanding = standings.find(team => team.team.id == this.barcelonaTeamId);
            
            return {
                position: barcelonaStanding?.rank || 'N/A',
                points: barcelonaStanding?.points || 'N/A',
                played: barcelonaStanding?.all?.played || 'N/A',
                wins: barcelonaStanding?.all?.win || 'N/A',
                draws: barcelonaStanding?.all?.draw || 'N/A',
                losses: barcelonaStanding?.all?.lose || 'N/A'
            };
        } catch (error) {
            console.error('Error fetching league standings:', error);
            return this.getMockStandings();
        }
    }

    async getAllFootballData() {
        try {
            const [teamInfo, standings, fixtures, results, playerStats] = await Promise.all([
                this.getBarcelonaInfo(),
                this.getLeagueStandings(),
                this.getBarcelonaFixtures(3),
                this.getBarcelonaLastResults(3),
                this.getLamineYamalStats()
            ]);

            return {
                teamInfo,
                standings,
                fixtures,
                results,
                playerStats
            };
        } catch (error) {
            console.error('Error fetching all football data:', error);
            throw error;
        }
    }

    // Mock data methods
    getMockDataForEndpoint(endpoint) {
        if (endpoint.includes('/teams')) {
            return { response: [this.getMockBarcelonaInfo()] };
        } else if (endpoint.includes('/fixtures') && endpoint.includes('next')) {
            return { response: this.getMockFixtures() };
        } else if (endpoint.includes('/fixtures') && endpoint.includes('last')) {
            return { response: this.getMockResults() };
        } else if (endpoint.includes('/players')) {
            return { response: [this.getMockPlayerStats()] };
        } else if (endpoint.includes('/standings')) {
            return { 
                response: [{ 
                    league: { 
                        standings: [[{ 
                            team: { id: this.barcelonaTeamId }, 
                            ...this.getMockStandings() 
                        }]] 
                    } 
                }] 
            };
        }
        return { response: [] };
    }

    getMockBarcelonaInfo() {
        return {
            team: {
                id: this.barcelonaTeamId,
                name: "Barcelona",
                code: "BAR",
                country: "Spain",
                founded: 1899,
                national: false,
                logo: "https://media.api-sports.io/football/teams/529.png"
            },
            venue: {
                id: 1492,
                name: "Camp Nou",
                address: "Carrer d'Aristides Maillol",
                city: "Barcelona",
                capacity: 99354,
                surface: "grass",
                image: "https://media.api-sports.io/football/venues/1492.png"
            }
        };
    }

    getMockFixtures() {
        const today = new Date();
        return [
            {
                fixture: {
                    id: 1001,
                    date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    status: { short: "NS" }
                },
                teams: {
                    home: { id: this.barcelonaTeamId, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
                    away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
                },
                league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" }
            },
            {
                fixture: {
                    id: 1002,
                    date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: { short: "NS" }
                },
                teams: {
                    home: { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
                    away: { id: this.barcelonaTeamId, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" }
                },
                league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" }
            }
        ];
    }

    getMockResults() {
        return [
            {
                fixture: {
                    id: 1003,
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    status: { short: "FT" }
                },
                teams: {
                    home: { id: this.barcelonaTeamId, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
                    away: { id: 532, name: "Valencia", logo: "https://media.api-sports.io/football/teams/532.png" }
                },
                goals: { home: 3, away: 1 },
                league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" }
            }
        ];
    }

    getMockPlayerStats() {
        return {
            player: {
                id: this.lamineYamalPlayerId,
                name: "Lamine Yamal",
                firstname: "Lamine",
                lastname: "Yamal",
                age: 17,
                birth: { date: "2007-07-13", place: "Mataró", country: "Spain" },
                nationality: "Spain",
                height: "180 cm",
                weight: "70 kg",
                injured: false,
                photo: "https://media.api-sports.io/football/players/276158.png"
            },
            statistics: [{
                team: { id: this.barcelonaTeamId, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
                league: { id: this.laLigaId, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png" },
                games: { appearances: 25, lineups: 22, minutes: 1980, number: 27, position: "Attacker" },
                goals: { total: 8, conceded: 0, assists: 12, saves: null },
                shots: { total: 45, on: 28 },
                passes: { total: 850, key: 48, accuracy: 12 }
            }]
        };
    }

    getMockStandings() {
        return {
            rank: 2,
            points: 72,
            all: { played: 28, win: 22, draw: 6, lose: 0 }
        };
    }
}

module.exports = FootballService;
