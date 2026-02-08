const mongoose = require('mongoose');

const RoomMessageSchema = new mongoose.Schema({
    room: { type: String, required: true }, // Room code
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    type: {
        type: String,
        enum: ['text', 'action', 'system'],
        default: 'text'
    },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        createdAt: { type: Date, default: Date.now }
    }],
    isPinned: { type: Boolean, default: false },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomMessage' },
    effects: String, // 'confetti', 'hearts', 'fireworks'
    metadata: mongoose.Schema.Types.Mixed // For actions, extra data
}, { timestamps: true });

RoomMessageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('RoomMessage', RoomMessageSchema);
