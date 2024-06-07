const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const { Transaction, maskSensitiveData } = require('./transactionModel');

// Creating an Express app
const app = express(); 

// Using CORS middleware to allow cross-origin requests
app.use(cors());

// Using bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// Connecting to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/transactions', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family:4
}).then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API endpoint for fetching transactions within a date range
app.get('/api/transactions', [
    // Validation and sanitization
    check('startDate').isISO8601().toDate(),
    check('endDate').isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], async (req, res) => {
    // Extracting startDate and endDate from query parameters
    const { startDate, endDate } = req.query;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    try{
        // Finding transactions within the specified date range and with certain statuses
        const transactions = await Transaction.find({
            date: { $gte: start, $lte: end },
            status: { $in: ["COMPLETED", "IN PROGRESS", "REJECTED"] }
        }).sort({ date: 1 });
        
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoint for fetching a single transaction by ID
app.get('/api/transactions/:id', [
    // Validation and sanitization
    check('id').isAlphanumeric().trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], async (req, res) => {
     // Extracting transaction ID from request parameters
    const { id } = req.params;
    try {
        const transaction = await Transaction.findOne({ id });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
          // Masking sensitive data in transaction object
        const maskedTransactions = maskSensitiveData(transaction.toObject());
        res.json(maskedTransactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Starting the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
