const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession');

// Get all messages
router.get('/', async (req, res) => {
    try {
        const messages = await Confession.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a message
router.post('/', async (req, res) => {
    const { content, anonymousHash, recipientHash } = req.body;
    try {
        const confession = new Confession({ content, anonymousHash: anonymousHash || 'anon', recipientHash: recipientHash || 'general' });
        await confession.save();

        // Emit to all connected clients
        const io = req.app.get('io');
        io.emit('new_confession', confession);

        res.json(confession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear all messages (Maintenance)
router.delete('/clear-all', async (req, res) => {
    try {
        const result = await Confession.deleteMany({});
        res.json({ msg: 'All messages cleared', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear messages by hash (User cleanup)
router.delete('/clear-my-messages', async (req, res) => {
    const { anonymousHash } = req.body;
    if (!anonymousHash) return res.status(400).json({ msg: 'Missing hash' });
    try {
        const result = await Confession.deleteMany({ anonymousHash });
        res.json({ msg: 'Your messages cleared', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
