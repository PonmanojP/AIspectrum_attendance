import React, { useState } from 'react'
import api from '../services/api'
import { verifyLocation } from '../utils/locationVerification'

const AttendanceTab = () => {
  const [mobile, setMobile] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAttendance, setMarkingAttendance] = useState(false)
  const [message, setMessage] = useState('')

  const handleSearch = async () => {
    setMessage('')
    setLoading(true)
    try {
      const res = await api.get('/attendance', { params: { mobile } })
      setRows(res.data || [])
      if (!res.data || res.data.length === 0) setMessage('No records found')
    } catch (err) {
      console.error(err)
      setMessage('Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const findKey = (keys, subs) => {
    const lower = keys.map(k => (k || '').toString().toLowerCase())
    for (const s of subs) {
      const idx = lower.findIndex(k => k.includes(s))
      if (idx !== -1) return keys[idx]
    }
    return null
  }

  const extractFieldValue = (row, fieldVariations) => {
    const keys = Object.keys(row || {})
    const key = findKey(keys, fieldVariations)
    return key ? (row[key] || '').toString().trim() : ''
  }

  const markAttendance = async (row) => {
    setMessage('')
    setMarkingAttendance(true)
    
    try {
      // Verify location first
      setMessage('Verifying your location...')
      const locationCheck = await verifyLocation()
      
      if (!locationCheck.isValid) {
        setMessage(locationCheck.message)
        setMarkingAttendance(false)
        return
      }

      // Location verified, proceed with marking attendance
      setMessage('Location verified. Marking attendance...')
      const mobileKey = Object.keys(row).find(k => /mobile/i.test(k)) || 'mobileNumber'
      await api.post('/attendance/mark', { mobile: row[mobileKey] || '' })
      
      setRows(prev => prev.map(r => {
        const mobileKey = Object.keys(r).find(k => /mobile/i.test(k)) || 'mobileNumber'
        if (String(r[mobileKey] || '') === String(row[mobileKey] || '')) {
          return { ...r, attendance: 'Yes' }
        }
        return r
      }))
      setMessage('Attendance marked successfully!')
    } catch (err) {
      console.error(err)
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Marking failed'
      setMessage(errorMsg)
    } finally {
      setMarkingAttendance(false)
    }
  }

  const renderCard = () => {
    if (!rows.length) return null

    return (
      <div className="attendance-cards-container">
        {rows.map((r, idx) => {
          // Prioritize Full Name over Name
          const name = extractFieldValue(r, ['full name', 'fullname']) || extractFieldValue(r, ['name'])
          const mobile = extractFieldValue(r, ['mobile', 'phone', 'mobile number'])
          const email = extractFieldValue(r, ['email', 'e-mail'])
          const days = extractFieldValue(r, ['days', 'participation', 'days of participation'])
          const username = extractFieldValue(r, ['username', 'roll number', 'roll_number', 'roll'])
          const attendance = (r.attendance || 'No') === 'Yes'

          return (
            <div className="attendance-card" key={idx}>
              <div className="attendance-card-header">
                <div className="attendance-card-name-wrapper">
                  <h3 className="attendance-card-name">{name || 'Participant'}</h3>
                  {username && <span className="attendance-card-key">{username}</span>}
                </div>
                <span className={`badge ${attendance ? 'yes' : 'no'}`}>
                  {attendance ? 'Present' : 'Absent'}
                </span>
              </div>
              
              <div className="attendance-card-body">
                <div className="attendance-card-field">
                  <span className="attendance-card-label">Mobile Number</span>
                  <span className="attendance-card-value">{mobile || 'N/A'}</span>
                </div>
                <div className="attendance-card-field">
                  <span className="attendance-card-label">Email</span>
                  <span className="attendance-card-value">{email || 'N/A'}</span>
                </div>
                <div className="attendance-card-field">
                  <span className="attendance-card-label">Days of Participation</span>
                  <span className="attendance-card-value">{days || 'N/A'}</span>
                </div>
              </div>

              <div className="attendance-card-actions">
                {attendance ? (
                  <button className="attendance-btn marked" disabled>
                    ✓ Attendance Marked
                  </button>
                ) : (
                  <button 
                    className="attendance-btn primary" 
                    onClick={() => markAttendance(r)}
                    disabled={markingAttendance}
                  >
                    {markingAttendance ? 'Verifying Location...' : 'Mark Attendance'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <h2>Attendance Lookup</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading || !mobile.trim()}>
          {loading ? 'Searching...' : 'Lookup'}
        </button>
      </div>

      {message && <div className={`message ${message.includes('failed') || message.includes('No records') ? 'error' : 'success'}`}>{message}</div>}

      {renderCard()}
    </div>
  )
}

export default AttendanceTab