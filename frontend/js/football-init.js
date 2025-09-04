import FootballManager from './football/FootballManager.js';

// Initialize Football Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const footballManager = new FootballManager();
    
    try {
        await footballManager.initialize();
        console.log('Football section initialized successfully');
    } catch (error) {
        console.error('Failed to initialize football section:', error);
    }
    
    // Store reference for potential cleanup
    window.footballManager = footballManager;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.footballManager) {
        window.footballManager.destroy();
    }
});
