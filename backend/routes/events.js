const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Get all event statuses
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ unlockDate: 1 });
        // Calculate dynamic status based on current date if not manually overridden
        // For prototype, we'll rely on the 'active' flag or date check
        const now = new Date();
        const enrichedEvents = events.map(e => ({
            ...e.toObject(),
            isUnlocked: e.active || e.unlockDate <= now
        }));
        res.json(enrichedEvents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manually toggle event (Simplified admin check)
router.post('/:key/toggle', async (req, res) => {
    const { key } = req.params;
    const { active } = req.body;
    try {
        const event = await Event.findOneAndUpdate({ key }, { active }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initialize simplified default events if empty
router.post('/init', async (req, res) => {
    try {
        const count = await Event.countDocuments();
        if (count > 0) return res.json({ msg: 'Events already initialized' });

        const defaults = [
            { name: 'Rose Day', key: 'rose', unlockDate: new Date('2026-02-07'), metadata: { themeColor: 'text-love-crimson' } },
            { name: 'Propose Day', key: 'propose', unlockDate: new Date('2026-02-08'), metadata: { themeColor: 'text-love-rose' } },
            { name: 'Chocolate Day', key: 'chocolate', unlockDate: new Date('2026-02-09'), metadata: { themeColor: 'text-amber-800' } },
            { name: 'Teddy Day', key: 'teddy', unlockDate: new Date('2026-02-10'), metadata: { themeColor: 'text-pink-400' } },
            { name: 'Promise Day', key: 'promise', unlockDate: new Date('2026-02-11'), metadata: { themeColor: 'text-blue-500' } },
            { name: 'Hug Day', key: 'hug', unlockDate: new Date('2026-02-12'), metadata: { themeColor: 'text-orange-400' } },
            { name: 'Kiss Day', key: 'kiss', unlockDate: new Date('2026-02-13'), metadata: { themeColor: 'text-red-600' } },
            { name: 'Valentine\'s Day', key: 'valentine', unlockDate: new Date('2026-02-14'), metadata: { themeColor: 'text-love-crimson' } },
        ];

        await Event.insertMany(defaults);
        res.json({ msg: 'Events initialized', count: defaults.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
