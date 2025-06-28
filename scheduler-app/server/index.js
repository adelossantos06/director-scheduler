// server/index.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Shift = require('./models/Shift');

const app = express();
const PORT = process.env.PORT || 8000;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── DATABASE ───────────────────────────────────────────────────────────────
mongoose
    .connect('mongodb://127.0.0.1:27017/directorDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── DIRECTOR MODEL ─────────────────────────────────────────────────────────
const directorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }
});
const Director = mongoose.model('Director', directorSchema);

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
    res.send('✅ API is running.');
});

// — Directors —

// GET all directors
app.get('/api/names', async (req, res) => {
    try {
        const directors = await Director.find();
        res.json(directors);
    } catch (err) {
        console.error('Error fetching directors:', err);
        res.status(500).json({ message: 'Server error while fetching directors' });
    }
});

// POST a new director
app.post('/api/names', async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const newDirector = new Director({ name: name.trim() });
        await newDirector.save();
        res.status(201).json(newDirector);
    } catch (err) {
        console.error('Error saving director:', err);
        res.status(500).json({ message: 'Server error while saving director' });
    }
});

// PATCH update director name
app.patch('/api/names/:id', async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const updated = await Director.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error('Error updating director:', err);
        res.status(500).json({ message: 'Server error while updating director' });
    }
});

// DELETE a director
app.delete('/api/names/:id', async (req, res) => {
    try {
        const deleted = await Director.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting director:', err);
        res.status(500).json({ message: 'Server error while deleting director' });
    }
});

// — Shifts —

// GET all shifts
app.get('/api/shifts', async (req, res) => {
    try {
        const shifts = await Shift.find();
        res.json(shifts);
    } catch (err) {
        console.error('Error fetching shifts:', err);
        res.status(500).json({ message: 'Server error while fetching shifts' });
    }
});

// POST a new shift
app.post('/api/shifts', async (req, res) => {
    const { start, end } = req.body;
    if (!start || !end) {
        return res.status(400).json({ message: 'Both start and end times are required' });
    }
    if (end <= start) {
        return res.status(400).json({ message: 'End time must be after start time' });
    }
    try {
        const newShift = new Shift({ start, end, directors: [] });
        const saved = await newShift.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creating shift:', err);
        res.status(500).json({ message: 'Server error while saving shift' });
    }
});

// DELETE a shift
app.delete('/api/shifts/:id', async (req, res) => {
    try {
        const deleted = await Shift.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting shift:', err);
        res.status(500).json({ message: 'Server error while deleting shift' });
    }
});

// PATCH assign a director
app.patch('/api/shifts/:id/assign', async (req, res) => {
    try {
        const { directorId } = req.body;
        const updated = await Shift.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { directors: directorId } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Shift not found' });
        res.json(updated);
    } catch (err) {
        console.error('Error assigning director to shift:', err);
        res.status(500).json({ message: 'Server error while assigning director' });
    }
});

// PATCH unassign a director
app.patch('/api/shifts/:id/unassign', async (req, res) => {
    try {
        const { directorId } = req.body;
        const updated = await Shift.findByIdAndUpdate(
            req.params.id,
            { $pull: { directors: directorId } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Shift not found' });
        res.json(updated);
    } catch (err) {
        console.error('Error unassigning director from shift:', err);
        res.status(500).json({ message: 'Server error while unassigning director' });
    }
});

/*
// (Optional) Serve React build in production:
// const clientBuildPath = path.join(__dirname, '../client/build');
// app.use(express.static(clientBuildPath));
// app.get('*', (req, res) => res.sendFile(path.join(clientBuildPath, 'index.html')));
*/

// ─── START SERVER ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
