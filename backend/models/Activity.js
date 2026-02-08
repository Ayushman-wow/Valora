const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true }, // 'rose', 'propose', etc.
    type: { type: String, required: true }, // 'tossed_rose', 'made_promise', etc.
    content: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible payload
    recipient: { type: String, default: null }, // Optional recipient name/ID
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
