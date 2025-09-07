import FootballAPI from './FootballAPI.js';

class FootballManager {
    constructor() {
        this.footballAPI = new FootballAPI();
        this.container = null;
        this.updateInterval = null;
    }

    async initialize() {
        this.container = document.getElementById('football-section');
        if (!this.container) {
            console.error('Football section container not found');
            return;
        }

        this.createFootballSection();
        await this.loadFootballData();
        
        // Update data every 30 minutes
        this.updateInterval = setInterval(() => {
            this.loadFootballData();
        }, 30 * 60 * 1000);
    }

    createFootballSection() {
        this.container.innerHTML = `
            <div class="football-container">
                <div class="football-header">
                    <img src="https://media.api-sports.io/football/teams/529.png" alt="FC Barcelona" class="team-logo">
                    <h3>FC Barcelona</h3>
                </div>
                
                <div class="football-content">
                    <!-- League Position -->
                    <div class="football-card league-position">
                        <h4>La Liga Position</h4>
                        <div id="league-position-content">
                            <div class="loading">Loading...</div>
                        </div>
                    </div>

                    <!-- Next Fixtures -->
                    <div class="football-card fixtures">
                        <h4>Next Matches</h4>
                        <div id="fixtures-content">
                            <div class="loading">Loading...</div>
                        </div>
                    </div>

                    <!-- Lamine Yamal Stats -->
                    <div class="football-card player-stats">
                        <h4>Lamine Yamal</h4>
                        <div id="player-stats-content">
                            <div class="loading">Loading...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadFootballData() {
        try {
            // Load all data in one call from backend
            const allData = await this.footballAPI.getAllFootballData();
            
            this.displayLeaguePosition(allData.standings);
            this.displayFixtures(allData.fixtures);
            this.displayPlayerStats(allData.playerStats);
        } catch (error) {
            console.error('Error loading football data:', error);
            this.displayError();
        }
    }

    displayLeaguePosition(standings) {
        const content = document.getElementById('league-position-content');
        if (!content) return;

        content.innerHTML = `
            <div class="standings-info">
                <div class="position-badge">
                    <span class="position-number">${standings.position}</span>
                    <span class="position-label">Position</span>
                </div>
                <div class="standings-details">
                    <div class="stat-item">
                        <span class="stat-label">Points:</span>
                        <span class="stat-value">${standings.points}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Played:</span>
                        <span class="stat-value">${standings.played}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">W-D-L:</span>
                        <span class="stat-value">${standings.wins}-${standings.draws}-${standings.losses}</span>
                    </div>
                </div>
            </div>
        `;
    }

    displayFixtures(fixtures) {
        const content = document.getElementById('fixtures-content');
        if (!content) return;

        if (!fixtures || fixtures.length === 0) {
            content.innerHTML = '<div class="no-data">No upcoming fixtures</div>';
            return;
        }

        // Show only next 2 fixtures to save space
        const fixturesHTML = fixtures.slice(0, 2).map(fixture => {
            const date = new Date(fixture.fixture.date);
            const isHome = fixture.teams.home.id === 529;
            const opponent = isHome ? fixture.teams.away : fixture.teams.home;
            
            return `
                <div class="fixture-item">
                    <div class="fixture-date">${this.formatDate(date)}</div>
                    <div class="fixture-match">
                        <img src="${opponent.logo}" alt="${opponent.name}" class="opponent-logo">
                        <span class="vs-text">${isHome ? 'vs' : '@'}</span>
                        <span class="opponent-name">${opponent.name}</span>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = fixturesHTML;
    }

    displayPlayerStats(playerData) {
        const content = document.getElementById('player-stats-content');
        if (!content) return;

        const player = playerData.player;
        const stats = playerData.statistics?.[0];

        if (!player || !stats) {
            content.innerHTML = '<div class="no-data">No player data available</div>';
            return;
        }

        content.innerHTML = `
            <div class="player-info">
                <img src="${player.photo}" alt="${player.name}" class="player-photo">
                <div class="player-details">
                    <div class="player-name">${player.name}</div>
                    <div class="player-age">Age: ${player.age}</div>
                </div>
            </div>
            <div class="player-stats">
                <div class="stat-row">
                    <span class="stat-label">Goals:</span>
                    <span class="stat-value">${stats.goals?.total || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Assists:</span>
                    <span class="stat-value">${stats.goals?.assists || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Apps:</span>
                    <span class="stat-value">${stats.games?.appearances || 0}</span>
                </div>
            </div>
        `;
    }

    formatDate(date) {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    displayError() {
        const containers = [
            'league-position-content', 
            'fixtures-content',
            'player-stats-content'
        ];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="error">Failed to load data</div>';
            }
        });
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export default FootballManager;
