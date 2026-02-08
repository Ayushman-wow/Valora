const mongoose = require('mongoose');

const ConfessionSchema = new mongoose.Schema({
    anonymousHash: { type: String, required: true }, // To link back to user if needed anonymously
    recipientHash: { type: String, required: true }, // Email hash or username
    content: { type: String, required: true },
    revealTime: { type: Date, default: Date.now }, // Can set to "Propose Day"
    isRevealed: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    theme: { type: String, default: 'rose' }, // color theme
}, { timestamps: true });

module.exports = mongoose.model('Confession', ConfessionSchema);
