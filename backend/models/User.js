const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // For linking
    password: { type: String, required: true }, // Simplified auth for prototype
    alias: { type: String, default: 'Anonymous Heart' },
    avatar: { type: String, default: '' },
    mood: { type: String, enum: ['Romantic', 'Playful', 'Sad', 'Excited', 'Cozy'], default: 'Romantic' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    coupleCode: { type: String, unique: true, sparse: true },
    anniversaryDate: { type: Date, default: null },
    interests: [String],
    settings: {
        notifications: { type: Boolean, default: true },
        privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' }
    },
    receivedGifts: [{
        giftId: String,
        senderId: String,
        message: String,
        receivedAt: { type: Date, default: Date.now }
    }],
    compatibilityStats: {
        matches: { type: Number, default: 0 },
        topMatch: String
    },
    resetToken: String,
    resetTokenExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
