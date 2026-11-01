
const express = require('express');

const app = express();

const PORT = 3000;

// Route 1: Welcome page
app.get('/', (req, res) => {
    res.send('Welcome to my Express Server!');
});

// Route 2: About information
app.get('/about', (req, res) => {
    res.json({
        name: 'Charan',
        section: 'AIML-2B'
    });
});

// Route 3: Current date and time
app.get('/time', (req, res) => {
    const currentTime = new Date();

    res.json({
        dateAndTime: currentTime
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
