const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

// Middleware to get user
const getUserByEmail = async (req, res, next) => {
    try {
        const email = req.headers['x-user-email'];
        if (!email) return res.status(401).json({ msg: 'No email header' });

        let user = await User.findOne({ email });
        if (!user) {
            // Auto-create guest user if needed, or error. 
            // For now, let's assume valid users mostly, but allow Guests -> anonymous activities?
            // Actually, we can link activities to a Guest User if we want.
            // Let's create a temporary user if not found? No, better to force auth or check "Guest" param.
            // As per room logic, we might have guest users.

            // If user doesn't exist, maybe returning 401 is better to force "auth flow" 
            // OR create a "Guest User" document on the fly.

            // Safe bet: find or create "Guest" based on email if it ends with @guest.com
            if (email.endsWith('@guest.com')) {
                const username = email.split('@')[0];
                user = await User.create({
                    email,
                    password: 'guestpassword123', // Dummy
                    username: `guest_${Date.now()}_${username}`,
                    alias: username,
                    role: 'user'
                });
            } else {
                return res.status(404).json({ msg: 'User not found' });
            }
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Create Activity
router.post('/activity', getUserByEmail, async (req, res) => {
    try {
        const { day, type, content, recipient } = req.body;

        const activity = new Activity({
            userId: req.user._id,
            day,
            type,
            content,
            recipient
        });

        await activity.save();
        res.json(activity);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get User Activities
router.get('/activity', getUserByEmail, async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Clear Activities (Optional)
router.delete('/activity', getUserByEmail, async (req, res) => {
    try {
        await Activity.deleteMany({ userId: req.user._id });
        res.json({ msg: 'Activities cleared' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// --- VIRTUAL INTERACTIONS (Hugs, Pokes, etc.) ---

// Send Interaction
router.post('/send', getUserByEmail, async (req, res) => {
    try {
        const { toUsername, type, message } = req.body;
        const toUser = await User.findOne({ username: toUsername });
        if (!toUser) return res.status(404).json({ msg: 'Recipient not found' });

        const interaction = new Interaction({
            from: req.user._id,
            to: toUser._id,
            type,
            message
        });

        await interaction.save();
        res.json({ msg: 'Interaction sent!', interaction });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Pending Interactions
router.get('/pending', getUserByEmail, async (req, res) => {
    try {
        const interactions = await Interaction.find({ to: req.user._id, status: 'pending' })
            .populate('from', 'username alias avatar mood')
            .sort({ createdAt: -1 });
        res.json({ interactions });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Interaction History
router.get('/history', getUserByEmail, async (req, res) => {
    try {
        const interactions = await Interaction.find({
            $or: [{ from: req.user._id }, { to: req.user._id }]
        })
            .populate('from', 'username alias')
            .populate('to', 'username alias')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ interactions });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get Stats
router.get('/stats', getUserByEmail, async (req, res) => {
    try {
        const sent = await Interaction.countDocuments({ from: req.user._id });
        const received = await Interaction.countDocuments({ to: req.user._id });
        const accepted = await Interaction.countDocuments({ to: req.user._id, status: 'accepted' });
        res.json({ sent, received, accepted });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Respond to Interaction
router.post('/:id/respond', getUserByEmail, async (req, res) => {
    try {
        const { response } = req.body; // 'accept' or 'decline'
        const interaction = await Interaction.findById(req.params.id);
        if (!interaction) return res.status(404).json({ msg: 'Interaction not found' });
        if (interaction.to.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not authorized' });

        interaction.status = response === 'accept' ? 'accepted' : 'declined';
        interaction.respondedAt = new Date();
        await interaction.save();

        res.json({ msg: `Interaction ${response}ed`, interaction });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Clear Virtual Interactions (Maintenance)
router.delete('/clear-history', getUserByEmail, async (req, res) => {
    try {
        const result = await Interaction.deleteMany({
            $or: [{ from: req.user._id }, { to: req.user._id }],
            status: { $in: ['accepted', 'declined'] }
        });
        res.json({ msg: 'Interaction history cleared', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
