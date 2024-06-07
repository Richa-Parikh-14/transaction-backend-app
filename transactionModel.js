const mongoose = require('mongoose');

// Helper function to mask sensitive data
function maskSensitiveData(data) {
    const maskedData = { ...data };
    maskedData.recipient.accountNumber = maskAccountNumber(data.recipient.accountNumber);
    maskedData.sender.dateOfBirth = maskDateOfBirth(data.sender.dateOfBirth);
    maskedData.sender.IDNumber = maskIDNumber(data.sender.IDNumber);
    return maskedData;
}

// Helper functions to mask sensitive data
function maskAccountNumber(accountNumber) {
    // it will show last four digits of account nummer
    return accountNumber.replace(/.(?=.{4})/g, '*');
}

function maskDateOfBirth(dateOfBirth) {
    // it will show only date
    return dateOfBirth.replace(/.(?=.{2})/g, '*');
}

function maskIDNumber(idNumber) {
    // it will show last four digits of id nummer
    return idNumber.replace(/.(?=.{4})/g, '*');
}

// Defining the transaction schema
const transactionSchema = new mongoose.Schema({
    id: String,
    date: Number,
    sender: {
        firstName: String,
        lastName: String,
        dateOfBirth: String, 
        IDNumber: String      
    },
    recipient: {
        firstName: String,
        lastName: String,
        email: String,
        accountNumber: String,
        bank: String
    },
    Amount: Number,
    CurrencyCd: String,
    Comments: String,
    status: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction, maskSensitiveData };
