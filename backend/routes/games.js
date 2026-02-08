const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');

// Helper to find a Session
const getSession = async (req, res, next) => {
    try {
        const session = await GameSession.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Game session not found' });
        req.session = session;
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Create a new Game Session
router.post('/create', async (req, res) => {
    try {
        const { type, mode, creator, roomCode } = req.body;

        const newGame = new GameSession({
            type,
            mode: mode || 'single',
            status: 'waiting',
            roomCode: roomCode || null,
            players: [{ username: creator, ready: true, score: 0 }],
            // Add default configs per type if needed (e.g. rounds logic)
        });

        await newGame.save();
        res.status(201).json(newGame);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Join a Game Session
router.post('/:id/join', getSession, async (req, res) => {
    try {
        const { username } = req.body;

        if (req.session.status !== 'waiting')
            return res.status(400).json({ msg: 'Game already started or finished' });

        if (req.session.players.some(p => p.username === username))
            return res.json(req.session); // Already joined

        req.session.players.push({ username, score: 0, ready: false });
        await req.session.save();

        res.json(req.session);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Game State (Generic)
router.patch('/:id/update', getSession, async (req, res) => {
    try {
        const updates = req.body; // e.g. { status: 'active', currentRound: 1, gameData: {...} }

        Object.assign(req.session, updates);

        // Safety check if completing
        if (updates.status === 'completed' && !req.session.winner) {
            // Find winner
            const winner = req.session.players.reduce((prev, current) =>
                (current.score > prev.score) ? current : prev
            );
            req.session.winner = winner.username;
            req.session.endedAt = new Date();
        }

        await req.session.save();
        res.json(req.session);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Update Player State (Score, Answer)
router.patch('/:id/player', getSession, async (req, res) => {
    try {
        const { username, scoreDelta, answer, ready } = req.body;

        const player = req.session.players.find(p => p.username === username);
        if (!player) return res.status(404).json({ msg: 'Player not found' });

        if (scoreDelta !== undefined) player.score += scoreDelta;
        if (answer !== undefined) player.answers.push(answer);
        if (ready !== undefined) player.ready = ready;

        // Auto-start check
        if (ready && req.session.mode === 'multi' && req.session.players.every(p => p.ready)) {
            req.session.status = 'active';
        }

        await req.session.save();
        res.json(req.session);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


// Get Session Details
router.get('/:id', getSession, (req, res) => {
    res.json(req.session);
});

// Clear Completed Games (Maintenance)
router.delete('/clear-completed', async (req, res) => {
    try {
        const result = await GameSession.deleteMany({ status: 'completed' });
        res.json({ msg: 'Completed games cleared', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
