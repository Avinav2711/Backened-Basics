const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const SECRET_KEY = 'bankingsecret';
let user = { username: 'user1', password: 'password123', balance: 1000 };

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === user.username && password === user.password) {
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, userData) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = userData;
        next();
    });
};

app.get('/balance', authenticateJWT, (req, res) => {
    res.json({ balance: user.balance });
});

app.post('/deposit', authenticateJWT, (req, res) => {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: 'Invalid deposit amount' });
    user.balance += amount;
    res.json({ balance: user.balance });
});

app.post('/withdraw', authenticateJWT, (req, res) => {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: 'Invalid withdrawal amount' });
    if (amount > user.balance) return res.status(400).json({ error: 'Insufficient balance' });
    user.balance -= amount;
    res.json({ balance: user.balance });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Banking API running on http://localhost:${PORT}`);
});
