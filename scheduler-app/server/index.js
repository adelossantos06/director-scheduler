const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json()); // parse JSON

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/directorDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define Mongoose schema & model
const directorSchema = new mongoose.Schema({
    name: String,
});

const Director = mongoose.model('Director', directorSchema);


// Routes

// POST: Add a new director
app.post('/api/names', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const newDirector = new Director({ name });
        await newDirector.save();
        res.status(201).json(newDirector);
    } catch (err) {
        console.error('Error saving director:', err);
        res.status(500).json({ message: 'Server error while saving name' });
    }
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

// GET: Root route
app.get('/', (req, res) => {
    res.send('✅ API is running.');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});