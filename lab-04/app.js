
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbPromise = require('./database');

const app = express();

const JWT_SECRET = 'my_lab4_secret_key_2026';

app.use(express.json());

// Home route
app.get('/', (request, response) => {
    response.send('Lab 4 Authentication Server is Running!');
});

// Registration API
app.post('/register', async (request, response) => {
    try {
        const { username, name, password } = request.body;

        // Validate input
        if (
            typeof username !== 'string' ||
            typeof name !== 'string' ||
            typeof password !== 'string' ||
            !username.trim() ||
            !name.trim() ||
            !password.trim()
        ) {
            return response.status(400).json({
                message: 'Username, name and password are required'
            });
        }

        const db = await dbPromise;

        // Check existing username
        const existingUser = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [username.trim()]
        );

        if (existingUser) {
            return response.status(400).json({
                message: 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.run(
            'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
            [username.trim(), name.trim(), hashedPassword]
        );

        return response.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return response.status(400).json({
                message: 'Username already exists'
            });
        }

        console.error('Registration error:', error.message);

        return response.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Login API
app.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;

        // Validate input
        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            !username.trim() ||
            !password.trim()
        ) {
            return response.status(400).json({
                message: 'Username and password are required'
            });
        }

        const db = await dbPromise;

        // Find user
        const user = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [username.trim()]
        );

        if (!user) {
            return response.status(400).json({
                message: 'Invalid username'
            });
        }

        // Compare password
        const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatched) {
            return response.status(400).json({
                message: 'Invalid password'
            });
        }

        // Generate JWT token
        const payload = {
            username: user.username
        };

        const jwtToken = jwt.sign(payload, JWT_SECRET);

        return response.status(200).json({
            jwt_token: jwtToken
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return response.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Start server
if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running at http://localhost:3000');
    });
}

module.exports = app;
