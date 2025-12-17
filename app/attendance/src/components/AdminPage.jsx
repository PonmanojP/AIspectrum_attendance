import React, { useState } from 'react'
import '../App.css'

const AdminPage = () => {
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState(false)
  const [message, setMessage] = useState('')

  const correct = 'spectrum@2025'

  const handleLogin = (e) => {
    e.preventDefault()
    setMessage('')
    if (password === correct) {
      setAuth(true)
      setMessage('Authenticated')
    } else {
      setMessage('Incorrect password')
    }
  }

  const handleDownload = (file) => {
    // navigate to the backend download endpoint which will send attachment
    // the dev server proxies /api to backend
    window.location.href = `/api/admin/download?file=${encodeURIComponent(file)}`
  }

  const goHome = () => {
    window.location.href = '/'
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — CSV Downloads</h2>
      {!auth ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Unlock</button>
          <button type="button" onClick={goHome}>Back</button>
          {message && <div style={{ marginLeft: 12 }}>{message}</div>}
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => handleDownload('attendance.csv')}>Download attendance.csv</button>
            <button style={{ marginLeft: 8 }} onClick={() => handleDownload('attendance for presenters.csv')}>Download attendance for presenters.csv</button>
            <button style={{ marginLeft: 8 }} onClick={() => handleDownload('new.csv')}>Download new.csv</button>
          </div>
          <div>
            <button onClick={() => { setAuth(false); setPassword(''); setMessage('Logged out') }}>Logout</button>
            <button style={{ marginLeft: 8 }} onClick={goHome}>Back to app</button>
          </div>
          {message && <div style={{ marginTop: 12 }}>{message}</div>}
        </div>
      )}
    </div>
  )
}

export default AdminPage
