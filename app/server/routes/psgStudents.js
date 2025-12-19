const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'PSGstudents attendance.csv');

// ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// utility to safely CSV-escape a value
function csvEscape(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

// ensure header present
function ensureHeader() {
    if (!fs.existsSync(FILE_PATH)) {
        const header = ['Name', 'Roll Number', 'Email', 'Mobile', 'Department', 'Attendance'].join(',') + '\n';
        fs.writeFileSync(FILE_PATH, header, 'utf8');
    }
}

// POST /api/psg-students
router.post('/', (req, res) => {
    const { name, roll_number, email, mobile, department } = req.body || {};
    if (!name || !roll_number || !email || !mobile || !department) {
        return res.status(400).json({ message: 'name, roll_number, email, mobile and department are required' });
    }

    try {
        ensureHeader();
        const row = [
            csvEscape(name),
            csvEscape(roll_number),
            csvEscape(email),
            csvEscape(mobile),
            csvEscape(department),
            csvEscape('Yes')
        ].join(',') + '\n';
        fs.appendFileSync(FILE_PATH, row, 'utf8');
        res.status(200).json({ message: 'PSG student registered and marked attended' });
    } catch (err) {
        console.error('Error writing PSGstudents attendance:', err);
        res.status(500).json({ message: 'Failed to save PSG student', error: err.message });
    }
});

module.exports = router;