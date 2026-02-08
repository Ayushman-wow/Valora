const express = require('express');
const router = express.Router();
const Couple = require('../models/Couple');
const User = require('../models/User');

// Middleware to get couple by user email
const getCoupleByUser = async (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ msg: 'No email provided' });

    try {
        const user = await User.findOne({ email });
        if (!user || !user.partnerId) return res.status(404).json({ msg: 'Couple not found' });

        const couple = await Couple.findOne({ members: user._id });
        if (!couple) return res.status(404).json({ msg: 'Couple data not initialized' });

        req.user = user;
        req.couple = couple;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get couple state
router.get('/me', getCoupleByUser, async (req, res) => {
    try {
        await req.couple.populate('members', 'alias username avatar mood');
        res.json(req.couple);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update couple settings (Anniversary, etc)
router.put('/me', getCoupleByUser, async (req, res) => {
    const { anniversary, sharedPreferences } = req.body;
    try {
        if (anniversary) req.couple.anniversary = anniversary;
        if (sharedPreferences) req.couple.sharedPreferences = sharedPreferences;

        await req.couple.save();
        res.json(req.couple);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
