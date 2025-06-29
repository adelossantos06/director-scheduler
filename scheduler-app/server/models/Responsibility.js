// server/models/Responsibility.js
const mongoose = require('mongoose');

const responsibilitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['director', 'utility'],
        required: true
    },
    show: {
        type: String,
        required: true,
        trim: true
    },
    directors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Director'
    }],
}, { timestamps: true });

module.exports = mongoose.model('Responsibility', responsibilitySchema);