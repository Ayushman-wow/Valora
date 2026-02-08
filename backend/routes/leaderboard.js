const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');

// Get top scores for a game
router.get('/:gameType', async (req, res) => {
    try {
        const scores = await Leaderboard.find({ gameType: req.params.gameType })
            .sort({ score: -1 })
            .limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a score
router.post('/', async (req, res) => {
    const { gameType, username, score, metadata } = req.body;
    try {
        // High score logic: only save if it's better than user's previous best for this game?
        // For now, just save every entry and we can aggregate
        const entry = new Leaderboard({ gameType, username, score, metadata });
        await entry.save();

        // Notify others of new high score via socket
        const io = req.app.get('io');
        io.emit('new_high_score', entry);

        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
