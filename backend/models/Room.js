const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    emoji: { type: String, default: '🎪' },
    themeColor: { type: String, default: '#DC143C' },
    type: {
        type: String,
        enum: ['friends', 'game', 'watch', 'party'],
        default: 'friends'
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPermanent: { type: Boolean, default: false },
    expiresAt: Date,
    roomCode: { type: String, unique: true, required: true },
    inviteLink: String,
    settings: {
        maxMembers: { type: Number, default: 50 },
        isPrivate: { type: Boolean, default: false },
        allowGames: { type: Boolean, default: true },
        allowPhotos: { type: Boolean, default: true },
        allowPolls: { type: Boolean, default: true }
    },
    stats: {
        messageCount: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 },
        photosShared: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Generate unique 6-digit room code
RoomSchema.pre('save', async function (next) {
    if (!this.roomCode) {
        this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    if (!this.inviteLink) {
        this.inviteLink = `/rooms/join/${this.roomCode}`;
    }
    next();
});

// Auto-add creator as admin and member
RoomSchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.admins.includes(this.creator)) {
            this.admins.push(this.creator);
        }
        if (!this.members.includes(this.creator)) {
            this.members.push(this.creator);
        }
    }
    next();
});

RoomSchema.index({ roomCode: 1 });
RoomSchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model('Room', RoomSchema);
