const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

// Route 1: Welcome page
app.get('/', (req, res) => {
    res.send('Backend Devolopment Fundamentals Lab-03 - RESt Api, Query Parameters, Validation and Debugging!');
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${PORT}`);
});