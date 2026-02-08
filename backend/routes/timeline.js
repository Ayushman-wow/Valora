const express = require('express');
const router = express.Router();
const TimelineEvent = require('../models/TimelineEvent');
const User = require('../models/User');

// Middleware to get user from email header
const getUserByEmail = async (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ msg: 'No email provided' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper to get couple ID
const getCoupleId = (user) => {
    if (!user.partnerId) return null;
    const ids = [user._id.toString(), user.partnerId.toString()].sort();
    return ids.join('_');
};

// Get timeline
router.get('/', getUserByEmail, async (req, res) => {
    try {
        if (!req.user.partnerId) {
            return res.status(400).json({ msg: 'You need to link a partner first!' });
        }

        const coupleId = getCoupleId(req.user);
        const events = await TimelineEvent.find({ coupleId }).sort({ date: 1 }); // Sort by date ascending

        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add event
router.post('/', getUserByEmail, async (req, res) => {
    try {
        if (!req.user.partnerId) {
            return res.status(400).json({ msg: 'You need to link a partner first!' });
        }

        const { title, description, date, type } = req.body;
        const coupleId = getCoupleId(req.user);

        const event = new TimelineEvent({
            coupleId,
            title,
            description,
            date: new Date(date),
            type,
            createdBy: req.user._id
        });

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event
router.delete('/:id', getUserByEmail, async (req, res) => {
    try {
        const event = await TimelineEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Check if user is part of the couple
        const coupleId = getCoupleId(req.user);
        if (event.coupleId !== coupleId) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ msg: 'Event removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
