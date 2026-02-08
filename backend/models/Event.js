const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., 'Rose Day'
    key: { type: String, required: true, unique: true }, // e.g., 'rose_day'
    active: { type: Boolean, default: false },
    unlockDate: { type: Date, required: true },
    description: String,
    metadata: {
        themeColor: String,
        icon: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
