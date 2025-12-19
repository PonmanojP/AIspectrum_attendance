const express = require('express')
const path = require('path')
const { appendCsv, ensureDir } = require('../utils/csvHelper')
const router = express.Router()

const DATA_DIR = path.join(__dirname, '..', 'data')
ensureDir(DATA_DIR)
const PSG_CSV = path.join(DATA_DIR, 'PSG_registration.csv')

router.post('/', (req, res) => {
  try {
    const { name, rollNumber, mobileNumber, email, address, department } = req.body
    if (!name || !rollNumber || !mobileNumber) {
      return res.status(400).json({ error: 'name, rollNumber and mobileNumber are required' })
    }
    const record = {
      Timestamp: new Date().toISOString(),
      Name: name,
      'Roll Number': rollNumber,
      'Mobile Number': mobileNumber,
      Email: email || '',
      Address: address || '',
      Department: department || ''
    }
    appendCsv(PSG_CSV, record)
    return res.json({ success: true, record })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to save PSG registration' })
  }
})

module.exports = router