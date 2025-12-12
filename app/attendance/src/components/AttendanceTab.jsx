import React, { useState } from 'react'
import api from '../services/api'

const AttendanceTab = () => {
  const [mobile, setMobile] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
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

  const markAttendance = async (row) => {
    setMessage('')
    try {
      await api.post('/attendance/mark', { mobile: row['Mobile Number'] || row.mobileNumber || row['Mobile'] || row['mobile'] || '' })
      setRows(prev => prev.map(r => {
        const mobileKey = Object.keys(r).find(k => /mobile/i.test(k)) || 'mobileNumber'
        if (String(r[mobileKey] || '') === String(row[mobileKey] || '')) {
          return { ...r, attendance: 'Yes' }
        }
        return r
      }))
      setMessage('Attendance marked')
    } catch (err) {
      console.error(err)
      setMessage('Marking failed')
    }
  }

  const renderTable = () => {
    if (!rows.length) return null
    const headers = Object.keys(rows[0])
    return (
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
              <th>Attendance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {headers.map(h => <td key={h}>{r[h] || ''}</td>)}
                <td>{r.attendance || 'No'}</td>
                <td>
                  { (r.attendance || 'No') === 'Yes' ? (
                    <span className="small">Already marked</span>
                  ) : (
                    <button onClick={() => markAttendance(r)}>Mark Attendance</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderGrid = () => {
    if (!rows.length) return null
    const headers = Object.keys(rows[0])

    const formatLabel = (h) => {
      // cleanup long header text for display
      return String(h)
        .replace(/[\n\r"]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*[:\-–—]\s*/g, ' — ')
        .trim()
    }

    return (
      <div className="grid-container">
        {rows.map((r, idx) => (
          <div className="card" key={idx}>
            <div className="card-header">
              <strong className="small">
                {r.Name || r.FullName || r['Full Name'] || r['Name'] || 'Participant'}
              </strong>
              <span className={`badge ${(r.attendance || 'No') === 'Yes' ? 'yes' : 'no'}`}>
                {(r.attendance || 'No')}
              </span>
            </div>

            <div className="card-body">
              {headers.map(h => (
                <div className="card-row" key={h}>
                  <div className="card-label">{formatLabel(h)}</div>
                  <div className="card-value">{r[h] || '-'}</div>
                </div>
              ))}
            </div>

            <div className="card-actions">
              {(r.attendance || 'No') === 'Yes' ? (
                <button className="action-btn" disabled>Marked</button>
              ) : (
                <button className="action-btn" onClick={() => markAttendance(r)}>Mark Attendance</button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2>Attendance Lookup</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>Lookup</button>
      </div>

      {message && <div className="small">{message}</div>}

      {/* grid for wide screens, table for narrow / fallback */}
      {renderGrid()}
      {renderTable()}
    </div>
  )
}

export default AttendanceTab