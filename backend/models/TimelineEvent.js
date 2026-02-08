const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
    coupleId: { type: String, required: true, index: true }, // Usually sorted combination of user IDs
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true }, // The actual date of the event (can be past or future)
    type: { type: String, enum: ['milestone', 'date', 'memory', 'future'], default: 'memory' },
    media: [String], // URLs to images/videos
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TimelineEvent', TimelineEventSchema);
