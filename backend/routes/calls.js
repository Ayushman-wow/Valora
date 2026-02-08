const express = require('express');
const router = express.Router();
const CallSession = require('../models/CallSession');
const User = require('../models/User');
const crypto = require('crypto');

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

// Create a call room
router.post('/create', getUserByEmail, async (req, res) => {
    try {
        const { participantUsername, callType = 'video' } = req.body;

        // Find participant
        const participant = await User.findOne({ username: participantUsername });
        if (!participant) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (participant._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ msg: 'Cannot call yourself' });
        }

        // Generate unique room name
        const roomName = `heartsync-${crypto.randomBytes(8).toString('hex')}`;
        const roomUrl = `https://heartsync.daily.co/${roomName}`; // This would be actual Daily.co room in production

        // For demo without Daily.co API, we'll use a simple room structure
        // In production, you'd call Daily.co API to create actual room

        // Create call session
        const callSession = new CallSession({
            participants: [req.user._id, participant._id],
            initiator: req.user._id,
            roomUrl: `/call/${roomName}`,
            roomName,
            callType,
            status: 'pending'
        });

        await callSession.save();
        await callSession.populate('participants', 'username alias avatar');

        // In production, emit WebSocket event to notify participant
        // io.to(participant._id.toString()).emit('incoming_call', callSession);

        res.json({
            msg: 'Call room created! 📞',
            callSession,
            roomUrl: `/call/${roomName}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get call session details
router.get('/:roomName', getUserByEmail, async (req, res) => {
    try {
        const { roomName } = req.params;

        const callSession = await CallSession.findOne({ roomName })
            .populate('participants', 'username alias avatar mood')
            .populate('initiator', 'username alias avatar');

        if (!callSession) {
            return res.status(404).json({ msg: 'Call session not found' });
        }

        // Check if user is participant
        const isParticipant = callSession.participants.some(
            p => p._id.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ msg: 'Not authorized to join this call' });
        }

        res.json({ callSession });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start call (update status to active)
router.post('/:roomName/start', getUserByEmail, async (req, res) => {
    try {
        const { roomName } = req.params;

        const callSession = await CallSession.findOne({ roomName });

        if (!callSession) {
            return res.status(404).json({ msg: 'Call session not found' });
        }

        callSession.status = 'active';
        callSession.startTime = new Date();

        await callSession.save();

        res.json({ msg: 'Call started!', callSession });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// End call
router.post('/:roomName/end', getUserByEmail, async (req, res) => {
    try {
        const { roomName } = req.params;

        const callSession = await CallSession.findOne({ roomName });

        if (!callSession) {
            return res.status(404).json({ msg: 'Call session not found' });
        }

        callSession.status = 'ended';
        callSession.endTime = new Date();

        if (callSession.startTime) {
            const duration = Math.floor((callSession.endTime - callSession.startTime) / 1000);
            callSession.duration = duration;
        }

        await callSession.save();

        res.json({ msg: 'Call ended', callSession, duration: callSession.duration });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get call history
router.get('/history/all', getUserByEmail, async (req, res) => {
    try {
        const callSessions = await CallSession.find({
            participants: req.user._id,
            status: 'ended'
        })
            .populate('participants', 'username alias avatar')
            .populate('initiator', 'username alias')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ callSessions, count: callSessions.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active calls
router.get('/active/all', getUserByEmail, async (req, res) => {
    try {
        const activeCalls = await CallSession.find({
            participants: req.user._id,
            status: { $in: ['pending', 'active'] }
        })
            .populate('participants', 'username alias avatar')
            .populate('initiator', 'username alias')
            .sort({ createdAt: -1 });

        res.json({ activeCalls, count: activeCalls.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear Call History
router.delete('/history/clear', getUserByEmail, async (req, res) => {
    try {
        const result = await CallSession.deleteMany({
            participants: req.user._id,
            status: 'ended'
        });
        res.json({ msg: 'Call history cleared', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
