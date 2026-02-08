const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to get user from email header
const getUserByEmail = async (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ msg: 'No email provided' });

    try {
        let user = await User.findOne({ email });
        // Auto-create for OAuth/Guest users if not found
        if (!user) {
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 1000);

            user = new User({
                email,
                username: `${baseUsername}${randomSuffix}`,
                password: 'oauth-user-' + Date.now(),
                alias: email.split('@')[0],
                isOAuth: true
            });
            await user.save();
        }
        // Ensure username exists if it was sparse (legacy support)
        if (!user.username) {
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 1000);
            user.username = `${baseUsername}${randomSuffix}`;
            await user.save();
        }
        req.user = user;
        next();
    } catch (err) {
        console.error("User Middleware Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get current user profile
router.get('/me', getUserByEmail, async (req, res) => {
    try {
        await req.user.populate('partnerId', 'alias email username avatar mood');
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update profile
router.put('/me', getUserByEmail, async (req, res) => {
    const { mood, alias, avatar, interests, username } = req.body;
    try {
        if (mood) req.user.mood = mood;
        if (alias) req.user.alias = alias;
        if (avatar) req.user.avatar = avatar;
        if (interests) req.user.interests = interests;

        // Handle username update separately to check uniqueness
        if (username && username !== req.user.username) {
            const existing = await User.findOne({ username });
            if (existing) return res.status(400).json({ msg: 'Username already taken' });
            req.user.username = username;
        }

        await req.user.save();
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Link Partner by Username
router.post('/link-partner', getUserByEmail, async (req, res) => {
    const { partnerUsername } = req.body;
    const Couple = require('../models/Couple');

    try {
        const currentUser = req.user;
        const partner = await User.findOne({ username: partnerUsername });

        if (!partner) return res.status(404).json({ msg: 'Partner not found with that username. Ask them to create a profile first!' });
        if (currentUser.username === partnerUsername) return res.status(400).json({ msg: 'Cannot link with yourself' });
        if (currentUser.partnerId) return res.status(400).json({ msg: 'You are already linked!' });

        // Generate a random couple code
        const coupleCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create Couple document
        const couple = new Couple({
            members: [currentUser._id, partner._id],
            coupleCode
        });
        await couple.save();

        // Two-way link on User models
        currentUser.partnerId = partner._id;
        currentUser.coupleCode = coupleCode;

        partner.partnerId = currentUser._id;
        partner.coupleCode = coupleCode;

        await currentUser.save();
        await partner.save();

        res.json({
            msg: 'Partner linked successfully! ❤️',
            partner: { alias: partner.alias, username: partner.username },
            coupleCode
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unlink Partner
router.post('/unlink-partner', getUserByEmail, async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser.partnerId) return res.status(400).json({ msg: 'No partner to unlink' });

        const partner = await User.findById(currentUser.partnerId);

        currentUser.partnerId = null;
        await currentUser.save();

        if (partner) {
            partner.partnerId = null;
            await partner.save();
        }

        res.json({ msg: 'Partner unlinked.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
