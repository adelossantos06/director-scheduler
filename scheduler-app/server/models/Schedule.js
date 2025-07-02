// server/models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    director: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Director',
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
    }],
    date: {
        type: Date,
        required: true
    },
    // shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    // you can omit shifts/resps here since they’re already on DirectorCard
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);