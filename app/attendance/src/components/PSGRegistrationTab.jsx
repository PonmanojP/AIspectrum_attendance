import React, { useState } from 'react'
import api from '../services/api'

const PSGRegistrationTab = () => {
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    mobileNumber: '',
    email: '',
    address: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/psg-registration', form)
      alert('PSG registration saved')
      setForm({ name: '', rollNumber: '', mobileNumber: '', email: '', address: '', department: '' })
    } catch (err) {
      console.error(err)
      alert('Failed to save registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>PSG Students registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
          <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Roll number" required />
        </div>
        <div className="form-row">
          <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="Mobile number" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        </div>
        <div className="form-row">
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
          <input name="department" value={form.department} onChange={handleChange} placeholder="Department" />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save PSG Registration'}</button>
      </form>
    </div>
  )
}

export default PSGRegistrationTab