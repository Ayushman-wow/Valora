const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    gameType: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 * 7 // Weekly leaderboard reset (approx)
    }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
