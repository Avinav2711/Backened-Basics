const express = require('express');
const app = express();

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

app.use(logger);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
    const token = authHeader.split(' ')[1];
    if (token !== 'mysecrettoken') return res.status(403).json({ error: 'Invalid or missing token' });
    next();
};

app.get('/public', (req, res) => {
    res.json({ message: 'This is a public route accessible by anyone.' });
});

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted! You have a valid Bearer token.' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
