// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/directorDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose schema & model
const directorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }
});

const Director = mongoose.model('Director', directorSchema);

// Routes

// Root route
app.get('/', (req, res) => {
    res.send('✅ API is running.');
});

// GET: Fetch all directors
app.get('/api/names', async (req, res) => {
    try {
        const directors = await Director.find();
        res.status(200).json(directors);
    } catch (err) {
        console.error('Error fetching directors:', err);
        res.status(500).json({ message: 'Server error while fetching names' });
    }
});

// POST: Add a new director
app.post('/api/names', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const newDirector = new Director({ name: name.trim() });
        await newDirector.save();
        res.status(201).json(newDirector);
    } catch (err) {
        console.error('Error saving director:', err);
        res.status(500).json({ message: 'Server error while saving name' });
    }
});

// DELETE: Remove a director by ID
app.delete('/api/names/:id', async (req, res) => {
    try {
        const deleted = await Director.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting director:', err);
        res.status(500).json({ message: 'Server error while deleting name' });
    }
});

// PATCH: Update a director's name
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
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating director:', err);
        res.status(500).json({ message: 'Server error while updating name' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});