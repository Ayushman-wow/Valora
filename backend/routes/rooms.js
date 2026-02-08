const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const RoomMessage = require('../models/RoomMessage');
const RoomGame = require('../models/RoomGame');
const RoomPoll = require('../models/RoomPoll');
const User = require('../models/User');

// Middleware to get user from email header
const getUserByEmail = async (req, res, next) => {
    const email = req.headers['x-user-email'];
    if (!email) return res.status(401).json({ msg: 'No email provided' });

    try {
        let user = await User.findOne({ email });

        // Auto-create user if not found
        if (!user) {
            user = await User.create({
                email,
                username: email.split('@')[0], // Use part before @ as username
                alias: email.split('@')[0],
                password: 'temp-password-' + Date.now() // Temporary password
            });
            console.log('✨ Auto-created user for:', email);
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('getUserByEmail error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Create room
router.post('/create', getUserByEmail, async (req, res) => {
    try {
        const { name, emoji, themeColor, type, isPermanent, settings } = req.body;

        const room = new Room({
            name,
            emoji: emoji || '🎪',
            themeColor: themeColor || '#DC143C',
            type: type || 'friends',
            creator: req.user._id,
            isPermanent: isPermanent || false,
            settings: settings || {}
        });

        if (!isPermanent) {
            // Expire after 24 hours
            room.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        await room.save();
        await room.populate('creator', 'username alias avatar');

        res.json({
            msg: 'Room created successfully! 🎉',
            room,
            roomCode: room.roomCode,
            inviteLink: room.inviteLink
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get room by code
router.get('/:roomCode', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode, isActive: true })
            .populate('creator', 'username alias avatar')
            .populate('members', 'username alias avatar mood')
            .populate('admins', 'username alias');

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        res.json({ room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join room
router.post('/:roomCode/join', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode, isActive: true });

        if (!room) {
            return res.status(404).json({ msg: 'Room not found or expired' });
        }

        // Check if private
        if (room.settings.isPrivate) {
            return res.status(403).json({ msg: 'This room is private' });
        }

        // Check max members
        if (room.members.length >= room.settings.maxMembers) {
            return res.status(403).json({ msg: 'Room is full' });
        }

        // Add member
        if (!room.members.includes(req.user._id)) {
            room.members.push(req.user._id);
            await room.save();
        }

        await room.populate('creator', 'username alias');

        res.json({
            msg: 'Joined room successfully!',
            room,
            roomCode: room.roomCode
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's rooms
router.get('/user/my-rooms', getUserByEmail, async (req, res) => {
    try {
        const rooms = await Room.find({
            members: req.user._id,
            isActive: true
        })
            .populate('creator', 'username alias')
            .sort({ updatedAt: -1 })
            .limit(20);

        res.json({ rooms, count: rooms.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get room messages
router.get('/:roomCode/messages', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { limit = 50, before } = req.query;

        const query = { room: roomCode };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await RoomMessage.find(query)
            .populate('user', 'username alias avatar mood')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ messages: messages.reverse() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active games
router.get('/:roomCode/games', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const games = await RoomGame.find({
            room: roomCode,
            status: { $in: ['waiting', 'active'] }
        })
            .populate('players.user', 'username alias avatar')
            .sort({ createdAt: -1 });

        res.json({ games });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active polls
router.get('/:roomCode/polls', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const polls = await RoomPoll.find({
            room: roomCode,
            isActive: true
        })
            .populate('creator', 'username alias')
            .sort({ createdAt: -1 });

        res.json({ polls });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update room settings (admin only)
router.patch('/:roomCode/settings', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { settings } = req.body;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if admin
        if (!room.admins.includes(req.user._id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        room.settings = { ...room.settings, ...settings };
        await room.save();

        res.json({ msg: 'Settings updated', room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete room (creator only)
router.delete('/:roomCode', getUserByEmail, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        if (room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Only creator can delete room' });
        }

        room.isActive = false;
        await room.save();

        res.json({ msg: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Room Maintenance Cleanup
router.delete('/maintenance/cleanup', async (req, res) => {
    try {
        // Find inactive or expired rooms
        const inactiveRooms = await Room.find({
            $or: [
                { isActive: false },
                { expiresAt: { $lt: new Date() } }
            ]
        });

        const roomCodes = inactiveRooms.map(r => r.roomCode);

        // Delete messages for these rooms
        const msgResult = await RoomMessage.deleteMany({ room: { $in: roomCodes } });

        // Finally delete or mark inactive the rooms themselves
        const roomResult = await Room.updateMany(
            { roomCode: { $in: roomCodes } },
            { isActive: false }
        );

        res.json({
            msg: 'Cleanup completed',
            roomsProcessed: roomCodes.length,
            messagesDeleted: msgResult.deletedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
