// Test script for Football API
const testFootballAPI = async () => {
    const baseUrl = 'http://localhost:3000/api/football';
    
    console.log('🧪 Testing Football API endpoints...\n');
    
    const endpoints = [
        { name: 'All Data', url: '/all' },
        { name: 'Team Info', url: '/team' },
        { name: 'Fixtures', url: '/fixtures' },
        { name: 'Results', url: '/results' },
        { name: 'Player Stats', url: '/player/lamine-yamal' },
        { name: 'Standings', url: '/standings' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Testing ${endpoint.name}...`);
            const response = await fetch(`${baseUrl}${endpoint.url}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ ${endpoint.name}: OK`);
                if (endpoint.name === 'Team Info') {
                    console.log(`   Team: ${data.data.team?.name || 'N/A'}`);
                    console.log(`   Stadium: ${data.data.venue?.name || 'N/A'}`);
                }
                if (endpoint.name === 'Player Stats') {
                    console.log(`   Player: ${data.data.player?.name || 'N/A'}`);
                    console.log(`   Age: ${data.data.player?.age || 'N/A'}`);
                }
            } else {
                console.log(`❌ ${endpoint.name}: ${data.error}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🏁 Football API test completed!');
};

// Run test if this file is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testFootballAPI();
} else {
    // Browser environment
    window.testFootballAPI = testFootballAPI;
}

module.exports = { testFootballAPI };
