const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/bank', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const accountSchema = new mongoose.Schema({
    username: String,
    balance: Number
});

const Account = mongoose.model('Account', accountSchema);

app.post('/transfer', async (req, res) => {
    const { fromUsername, toUsername, amount } = req.body;

    if (amount <= 0) return res.status(400).json({ error: 'Invalid transfer amount' });

    const sender = await Account.findOne({ username: fromUsername });
    const receiver = await Account.findOne({ username: toUsername });

    if (!sender) return res.status(404).json({ error: 'Sender account not found' });
    if (!receiver) return res.status(404).json({ error: 'Receiver account not found' });
    if (sender.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({ message: 'Transfer successful', senderBalance: sender.balance, receiverBalance: receiver.balance });
});

app.get('/accounts', async (req, res) => {
    const accounts = await Account.find();
    res.json(accounts);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Bank transfer API running on http://localhost:${PORT}`);
});
