const mongoose = require('mongoose');

const RoomPollSchema = new mongoose.Schema({
    room: { type: String, required: true }, // Room code
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, maxlength: 200 },
    options: [{ type: String, maxlength: 100 }],
    votes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        optionIndex: Number,
        votedAt: { type: Date, default: Date.now }
    }],
    isAnonymous: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    expiresAt: Date,
    type: {
        type: String,
        enum: ['game', 'movie', 'general'],
        default: 'general'
    }
}, { timestamps: true });

RoomPollSchema.index({ room: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('RoomPoll', RoomPollSchema);
