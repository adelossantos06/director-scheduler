// models/ScheduleEntry.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    director: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Director',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    responsibilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Responsibility'
    }]
}, {
    timestamps: true
});

// Prevent duplicate same‐director + same‐date + same‐shift
scheduleSchema.index({ director: 1, date: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model('ScheduleEntry', scheduleSchema);
