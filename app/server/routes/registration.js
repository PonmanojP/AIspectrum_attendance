const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const { writeToCSV } = require('../utils/csvHelper');

// Route to handle new registration
router.post('/register', (req, res) => {
    const newRegistration = req.body;

    // Add the new registration to the new.csv file
    writeToCSV('data/new.csv', newRegistration)
        .then(() => {
            res.status(201).json({ message: 'Registration successful', data: newRegistration });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error saving registration', error });
        });
});

module.exports = router;