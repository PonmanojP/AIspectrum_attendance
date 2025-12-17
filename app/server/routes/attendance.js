const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const { updateAttendance, getUserDetails, getUserByPaperId, updateAttendanceByPaperId } = require('../utils/csvHelper');

// Route to retrieve user details based on mobile number
router.get('/details/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    getUserDetails(mobile)
        .then(user => {
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error retrieving user details', error: err });
        });
});

// Route to mark attendance
router.post('/mark-attendance', (req, res) => {
    const { mobile } = req.body;
    updateAttendance(mobile)
        .then(() => {
            res.status(200).json({ message: 'Attendance marked successfully' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error marking attendance', error: err });
        });
});

// Routes for presenters identified by paper registration id
// GET details by paper id
router.get('/details/paper/:paperId', (req, res) => {
    const paperId = req.params.paperId;
    getUserByPaperId(paperId)
        .then(user => {
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User (paper id) not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error retrieving user details by paper id', error: err });
        });
});

// POST mark attendance by paper id (body: { paper_id: 'REG001' } )
router.post('/mark-attendance/paper', (req, res) => {
    const { paper_id, paperId } = req.body;
    const id = paper_id || paperId;
    if (!id) return res.status(400).json({ message: 'paper_id is required in body' });
    updateAttendanceByPaperId(id)
        .then(updated => {
            if (updated) {
                res.status(200).json({ message: 'Attendance marked successfully for paper id' });
            } else {
                res.status(404).json({ message: 'Record not found or could not update' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error marking attendance by paper id', error: err });
        });
});

module.exports = router;