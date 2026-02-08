const mongoose = require('mongoose');

const CallSessionSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomUrl: { type: String, required: true },
    roomName: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'active', 'ended', 'missed'],
        default: 'pending'
    },
    startTime: Date,
    endTime: Date,
    duration: { type: Number, default: 0 }, // in seconds
    callType: {
        type: String,
        enum: ['video', 'audio'],
        default: 'video'
    }
}, { timestamps: true });

// Index for faster queries
CallSessionSchema.index({ participants: 1, status: 1, createdAt: -1 });
CallSessionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CallSession', CallSessionSchema);
