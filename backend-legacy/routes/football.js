const express = require('express');
const FootballService = require('../services/FootballService');

const router = express.Router();
const footballService = new FootballService();

// Get all football data
router.get('/all', async (req, res) => {
    try {
        const data = await footballService.getAllFootballData();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching all football data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch football data'
        });
    }
});

// Get Barcelona team info
router.get('/team', async (req, res) => {
    try {
        const teamInfo = await footballService.getBarcelonaInfo();
        res.json({
            success: true,
            data: teamInfo
        });
    } catch (error) {
        console.error('Error fetching team info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team info'
        });
    }
});

// Get Barcelona fixtures
router.get('/fixtures', async (req, res) => {
    try {
        const next = parseInt(req.query.next) || 5;
        const fixtures = await footballService.getBarcelonaFixtures(next);
        res.json({
            success: true,
            data: fixtures
        });
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch fixtures'
        });
    }
});

// Get Barcelona results
router.get('/results', async (req, res) => {
    try {
        const last = parseInt(req.query.last) || 3;
        const results = await footballService.getBarcelonaLastResults(last);
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch results'
        });
    }
});

// Get Lamine Yamal stats
router.get('/player/lamine-yamal', async (req, res) => {
    try {
        const playerStats = await footballService.getLamineYamalStats();
        res.json({
            success: true,
            data: playerStats
        });
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player stats'
        });
    }
});

// Get league standings
router.get('/standings', async (req, res) => {
    try {
        const standings = await footballService.getLeagueStandings();
        res.json({
            success: true,
            data: standings
        });
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch standings'
        });
    }
});

module.exports = router;
