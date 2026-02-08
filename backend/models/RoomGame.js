const mongoose = require('mongoose');

const RoomGameSchema = new mongoose.Schema({
    room: { type: String, required: true }, // Room code
    type: {
        type: String,
        enum: ['movie-emoji', 'song-guess', 'truth-dare', 'never-have-i', 'most-likely', 'fast-tap'],
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    players: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, default: 0 },
        ready: { type: Boolean, default: false },
        answers: [mongoose.Schema.Types.Mixed]
    }],
    currentRound: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 10 },
    gameData: mongoose.Schema.Types.Mixed, // Game-specific data
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: Date,
    endedAt: Date
}, { timestamps: true });

RoomGameSchema.index({ room: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('RoomGame', RoomGameSchema);
