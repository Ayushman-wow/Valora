const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['hand-hold', 'head-pat', 'forehead-kiss', 'hug', 'poke', 'rose', 'chocolate', 'letter'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    message: { type: String, maxlength: 200 },
    respondedAt: Date
}, { timestamps: true });

// Index for faster queries
InteractionSchema.index({ to: 1, status: 1, createdAt: -1 });
InteractionSchema.index({ from: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', InteractionSchema);
