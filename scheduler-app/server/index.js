// server/index.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Shift = require('./models/Shift');
const Responsibility = require('./models/Responsibility');
const Schedule = require('./models/Schedule');
// const ScheduleEntry = require('./models/ScheduleEntry');

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

app.get('/api/responsibilities', async (req, res) => {
    try {
        const list = await Responsibility.find();
        res.status(200).json(list);
    } catch (err) {
        console.error('Error fetching responsibilities:', err);
        res.status(500).json({ message: 'Server error while fetching responsibilities' });
    }
});



// PATCH assign a director
app.patch('/api/responsibilities/:id/assign', async (req, res) => {
    const { directorId } = req.body;
    try {
        const updated = await Responsibility.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { directors: directorId } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// PATCH unassign a director
app.patch('/api/responsibilities/:id/unassign', async (req, res) => {
    const { directorId } = req.body;
    try {
        const updated = await Responsibility.findByIdAndUpdate(
            req.params.id,
            { $pull: { directors: directorId } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// POST create a new responsibility
app.post('/api/responsibilities', async (req, res) => {
    const { type, show } = req.body;
    if (!type || !show?.trim()) {
        return res.status(400).json({ message: 'Type and show name are required' });
    }
    try {
        const resp = new Responsibility({
            type,
            show: show.trim(),
            directors: []
        });
        await resp.save();
        res.status(201).json(resp);
    } catch (err) {
        console.error('Error saving responsibility:', err);
        res.status(500).json({ message: 'Server error while saving responsibility' });
    }
});

// PATCH /api/responsibilities/:id/assign
app.patch('/api/responsibilities/:id/assign', async (req, res) => {
    const { directorId } = req.body;
    try {
        const resp = await Responsibility.findById(req.params.id);
        if (!resp) {
            return res.status(404).json({ message: 'Responsibility not found' });
        }
        // if you only ever want one director:
        if (resp.directors.length >= 1) {
            return res
                .status(400)
                .json({ message: 'This responsibility is already assigned to another director.' });
        }
        resp.directors.push(directorId);
        await resp.save();
        res.json(resp);
    } catch (err) {
        console.error('Error assigning responsibility:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE a responsibility
app.delete('/api/responsibilities/:id', async (req, res) => {
    try {
        const deleted = await Responsibility.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Responsibility not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting responsibility:', err);
        res.status(500).json({ message: 'Server error while deleting responsibility' });
    }
});

// GET all schedules, populated
app.get('/api/schedules', async (req, res) => {
    try {
        const list = await Schedule.find()
            .populate('director')
            .populate('shift')
            .populate('responsibilities');
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// POST create a schedule entry
app.post('/api/schedules', async (req, res) => {
    console.log('body:', req.body);
    const { director, date, shift } = req.body;
    if (!director || !date || !shift) {
        return res
            .status(400)
            .json({ message: 'director, date and shift are all required.' });
    }
    try {
        let sch = new Schedule({ director, date, shift });
        sch = await sch.save();
        sch = await sch.populate('director').populate('shift');
        res.status(201).json(sch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// PATCH update shift or responsibilities
app.patch('/api/schedules/:id', async (req, res) => {
    const updates = {};
    if (req.body.shift) updates.shift = req.body.shift;
    if (req.body.responsibilities) updates.responsibilities = req.body.responsibilities;
    try {
        const updated = await Schedule.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        )
            .populate('director')
            .populate('shift')
            .populate('responsibilities');
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE a booking
app.delete('/api/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
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
