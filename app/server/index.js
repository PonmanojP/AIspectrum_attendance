const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { ensureDir, readCsv, writeCsv, appendCsv } = require('./utils/csvHelper');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
ensureDir(DATA_DIR);
ensureDir(UPLOADS_DIR);

const attendanceCsv = path.join(DATA_DIR, 'attendance.csv');
const attendanceCsvPaperId = path.join(DATA_DIR, 'attendance for presenters.csv');
const newCsv = path.join(DATA_DIR, 'new.csv');

// multer setup for screenshot uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ts = Date.now();
        cb(null, `${ts}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// helper to find mobile column dynamically
function getMobileKey(rows) {
    if (!rows || !rows.length) return null;
    return Object.keys(rows[0]).find(k => k.toLowerCase().includes('mobile')) || null;
}

// helper to find paperID dynamically
function getPaperIdKey(rows) {
    if (!rows || !rows.length) return null;
    return Object.keys(rows[0]).find(k => k.toLowerCase().includes('paper_id')) || null;
}

// GET /api/attendance?mobile=xxxxx
app.get('/api/attendance', (req, res) => {
    const mobile = req.query.mobile;
    if (!mobile) return res.status(400).json({ error: 'mobile query required' });

    const rows = readCsv(attendanceCsv);
    if (!rows.length) return res.json([]);

    const mobileKey = getMobileKey(rows) || 'mobileNumber';
    const matches = rows.filter(r => String(r[mobileKey] || '').trim() === String(mobile).trim());
    const result = matches.map(r => ({ ...r, attendance: r.attendance || 'No' }));
    res.json(result);
});

// GET /api/attendance/paper?paperId=xxxxx
app.get('/api/attendance/paper', (req, res) => {
  console.log('[GET /api/attendance/paper] called');
  const paperId = req.query.paperId || req.query.paper_id;
  if (!paperId) return res.status(400).json({ error: 'paperId query required' });

  const rows = readCsv(attendanceCsvPaperId);
  if (!rows.length) return res.status(404).json({ error: 'presenters attendance CSV is empty or missing' });

  // detect paper id column flexibly
  const keys = Object.keys(rows[0] || {});
  let paperKey = findKey(keys, ['paper_id', 'paper id', 'paperid', 'paper']);
  // fallback: normalize headers (remove non-alphanum) and look for 'paperid'
  if (!paperKey) {
    paperKey = keys.find(k => (k || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '').includes('paperid')) || null;
  }
  if (!paperKey) {
    console.error('[GET /api/attendance/paper] header keys:', keys);
    return res.status(500).json({ error: 'paper id column not found in CSV' });
  }
  // log for debugging
  console.log(`[GET /api/attendance/paper] lookup paperId=${paperId} using column='${paperKey}' rows=${rows.length}`);

  const needle = String(paperId).trim().toLowerCase();
  const matches = rows.filter(r => String(r[paperKey] || '').replace(/\"|\r|\n/g, '').trim().toLowerCase() === needle);
  const result = matches.map(r => ({ ...r, attendance: r.attendance || 'No' }));
  if (!result.length) return res.status(404).json({ error: 'paperId not found' });
  res.json(result);
});
// POST /api/attendance/mark  body: { mobile }
app.post('/api/attendance/mark', (req, res) => {
    const mobile = req.body.mobile;
    if (!mobile) return res.status(400).json({ error: 'mobile required' });

    const rows = readCsv(attendanceCsv);
    if (!rows.length) return res.status(404).json({ error: 'attendance CSV not found or empty' });

    const mobileKey = getMobileKey(rows) || 'mobileNumber';
    let updated = false;
    const newRows = rows.map(r => {
        if (String(r[mobileKey] || '').trim() === String(mobile).trim()) {
            r.attendance = 'Yes';
            updated = true;
        }
        if (!r.attendance) r.attendance = 'No';
        return r;
    });

    if (!updated) return res.status(404).json({ error: 'mobile not found in attendance.csv' });

    writeCsv(attendanceCsv, newRows);
    res.json({ success: true, message: 'Attendance marked' });
});

// POST /api/attendance/mark/paper  body: { paperId or paper_id }
app.post('/api/attendance/mark/paper', (req, res) => {
  const paperId = req.body.paperId || req.body.paper_id;
  if (!paperId) return res.status(400).json({ error: 'paper_id required' });

  const rows = readCsv(attendanceCsvPaperId);
  if (!rows.length) return res.status(404).json({ error: 'presenters attendance CSV not found or empty' });

  const keys = Object.keys(rows[0] || {});
  const paperKey = findKey(keys, ['paper_id', 'paper id', 'paperid', 'paper']);
  const attendanceKey = findKey(keys, ['attendance', 'attend']);
  if (!paperKey || !attendanceKey) return res.status(500).json({ error: 'required columns not found in CSV' });

  let updated = false;
  const newRows = rows.map(r => {
    if (String(r[paperKey] || '').trim().toLowerCase() === String(paperId).trim().toLowerCase()) {
      r[attendanceKey] = 'Yes';
      updated = true;
    }
    if (!r[attendanceKey]) r[attendanceKey] = 'No';
    return r;
  });

  if (!updated) return res.status(404).json({ error: 'paperId not found in presenters CSV' });

  writeCsv(attendanceCsvPaperId, newRows);
  res.json({ success: true, message: 'Attendance marked for paper id' });
});

// POST /api/registration  multipart form
app.post('/api/registration', upload.single('paymentScreenshot'), (req, res) => {
    const body = req.body;
    const file = req.file;
    const record = {
        Timestamp: new Date().toISOString(),
        FullName: body.name || '',
        Email: body.email || '',
        'Mobile Number': body.mobileNumber || '',
        'Participant Category': body.category || '',
        Department: body.department || '',
        Institution: body.institution || '',
        'Institution Type': body.institutionType || '',
        'Select Days of Participation': body.daysOfParticipation || '',
        'Payment Method': body.paymentMethod || '',
        'Transaction ID / UPI Reference Number': body.transactionId || '',
        'Upload Payment Screenshot': file ? path.basename(file.path) : '',
        attendance: 'Yes'
    };

    appendCsv(newCsv, record);
    res.json({ success: true, message: 'Registration saved', record });
});

// POST /api/psg-students-registration - Save PSG student to attendance.csv
app.post('/api/psg-students-registration', (req, res) => {
    try {
        const { name, rollNumber, department, email, phoneNumber, days } = req.body;
        
        if (!name || !rollNumber || !department || !email || !phoneNumber || !days || days.length === 0) {
            return res.status(400).json({ error: 'name, rollNumber, department, email, phoneNumber, and days are required' });
        }

        // Read existing CSV to get all headers
        const existingRows = readCsv(attendanceCsv);
        if (!existingRows.length) {
            return res.status(500).json({ error: 'attendance.csv is empty or missing headers' });
        }

        // Get all column headers from existing CSV
        const headers = Object.keys(existingRows[0]);
        
        // Format days selection (e.g., ["day1", "day2"] -> "Day 1 & Day 2")
        const formatDays = (daysArray) => {
            const dayMap = { day1: 'Day 1', day2: 'Day 2', day3: 'Day 3' };
            const formatted = daysArray.map(d => dayMap[d.toLowerCase()] || d).join(' & ');
            return formatted;
        };

        // Create record with all fields from CSV, setting most to empty string
        const record = {};
        headers.forEach(header => {
            record[header] = '';
        });

        // Set the provided fields
        // Find matching header keys (flexible matching)
        const nameKey = findKey(headers, ['name']) || 'Name';
        const fullNameKey = findKey(headers, ['full name', 'fullname']) || 'Full Name';
        const emailKey = findKey(headers, ['email', 'e-mail']) || 'Email- id';
        const mobileKey = findKey(headers, ['mobile', 'phone']) || 'Mobile Number';
        const deptKey = findKey(headers, ['department']) || 'Department';
        const daysKey = findKey(headers, ['days', 'participation']) || 'Select Days of Participation :AI Spectrum ';
        const attendanceKey = 'attendance';
        const usernameKey = findKey(headers, ['username']) || 'Username';

        // Set both Name and Full Name fields
        record[nameKey] = name;
        if (fullNameKey) record[fullNameKey] = name;
        record[emailKey] = email;
        record[mobileKey] = phoneNumber;
        record[deptKey] = department;
        record[daysKey] = formatDays(Array.isArray(days) ? days : [days]);
        record[attendanceKey] = 'Yes';
        record[usernameKey] = rollNumber; // Use roll number as username
        
        // Format timestamp to match CSV format: YYYY-MM-DD HH:MM:SS
        const now = new Date();
        const timestampKey = findKey(headers, ['timestamp']) || 'Timestamp';
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        record[timestampKey] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        // Append to attendance.csv
        appendCsv(attendanceCsv, record);
        res.json({ success: true, message: 'PSG student registered and attendance marked', record });
    } catch (err) {
        console.error('Error saving PSG student registration:', err);
        res.status(500).json({ error: 'Failed to save PSG student registration', details: err.message });
    }
});

// Helper to pick keys (name, mobile, email) with flexible headers
function findKey(objKeys, substrings) {
  const lower = objKeys.map(k => k.toLowerCase());
  for (const s of substrings) {
    const idx = lower.findIndex(k => k.includes(s));
    if (idx !== -1) return objKeys[idx];
  }
  return null;
}

app.get('/api/people', (req, res) => {
  try {
    const registeredRows = readCsv(attendanceCsv); // original CSV
    const onsiteRows = readCsv(newCsv); // new onsite registrations

    const mapRow = (r) => {
      const keys = Object.keys(r || {});
      const nameKey = findKey(keys, ['name', 'full name', 'fullname']);
      const mobileKey = findKey(keys, ['mobile', 'phone']);
      const emailKey = findKey(keys, ['email', 'e-mail']);
      return {
        name: (r[nameKey] || r['FullName'] || r['Full Name'] || '').toString().trim(),
        mobile: (r[mobileKey] || r['Mobile Number'] || r['mobileNumber'] || '').toString().trim(),
        email: (r[emailKey] || r['Email'] || r['Email- id'] || '').toString().trim()
      };
    };

    const registered = registeredRows.map(mapRow);
    const onsite = onsiteRows.map(mapRow);
    res.json({ registered, onsite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read datasets' });
  }
});

app.use('/uploads', express.static(UPLOADS_DIR));

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Data folder: ${DATA_DIR}`);
});