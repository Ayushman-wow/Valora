const mongoose = require('mongoose');

const CoupleSchema = new mongoose.Schema({
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    coupleCode: { type: String, unique: true },
    anniversary: Date,
    memories: [{
        day: String,
        activity: String,
        content: Object,
        createdAt: { type: Date, default: Date.now }
    }],
    quests: [{
        questId: String,
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        progress: Number,
        completedAt: Date
    }],
    sharedPreferences: {
        theme: { type: String, default: 'Classic' },
        isPublic: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('Couple', CoupleSchema);
