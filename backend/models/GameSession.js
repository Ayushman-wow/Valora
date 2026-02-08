const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    username: String,
    score: { type: Number, default: 0 },
    ready: { type: Boolean, default: false },
    answers: [mongoose.Schema.Types.Mixed] // Store game-specific answer objects
});

const GameSessionSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'love-wheel', 'truth-dare', etc.
    mode: { type: String, enum: ['single', 'multi'], default: 'single' },
    status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
    roomCode: { type: String, default: null }, // Optional link to a room
    players: [PlayerSchema],
    currentRound: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 5 },
    gameData: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible state
    winner: String,
    createdAt: { type: Date, default: Date.now },
    endedAt: Date
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
