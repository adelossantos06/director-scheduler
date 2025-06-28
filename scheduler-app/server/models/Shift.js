// models/Shift.js
const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    start: { type: String, required: true },
    end: { type: String, required: true },
    directors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Director' }],
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
