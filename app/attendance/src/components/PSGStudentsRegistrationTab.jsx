import React, { useState } from 'react';
import api from '../services/api';
import { verifyLocation } from '../utils/locationVerification';

export default function PSGStudentsRegistrationTab() {
    const [form, setForm] = useState({
        name: '',
        rollNumber: '',
        email: '',
        phoneNumber: '',
        department: '',
        days: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDayChange = (day) => {
        setForm(prev => {
            const currentDays = prev.days || [];
            if (currentDays.includes(day)) {
                // Remove day if already selected
                return { ...prev, days: currentDays.filter(d => d !== day) };
            } else {
                // Add day if not selected
                return { ...prev, days: [...currentDays, day] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (form.days.length === 0) {
            setMessage('Please select at least one day');
            setLoading(false);
            return;
        }

        try {
            // Verify location first
            setMessage('Verifying your location...');
            const locationCheck = await verifyLocation();
            
            if (!locationCheck.isValid) {
                setMessage(locationCheck.message);
                setLoading(false);
                return;
            }

            // Location verified, proceed with registration
            setMessage('Location verified. Registering...');
            await api.post('/psg-students-registration', form);
            setMessage('PSG student registered and attendance marked successfully!');
            setForm({
                name: '',
                rollNumber: '',
                email: '',
                phoneNumber: '',
                department: '',
                days: []
            });
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to register student';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>PSG Students Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="rollNumber"
                        placeholder="Roll Number"
                        value={form.rollNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-row">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-row">
                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={form.department}
                        onChange={handleChange}
                        required
                    />
                    <div className="days-checkbox-wrapper">
                        <label className="days-label">Select Days of Participation</label>
                        <div className="days-checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.days.includes('day1')}
                                    onChange={() => handleDayChange('day1')}
                                />
                                <span>Day 1</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.days.includes('day2')}
                                    onChange={() => handleDayChange('day2')}
                                />
                                <span>Day 2</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.days.includes('day3')}
                                    onChange={() => handleDayChange('day3')}
                                />
                                <span>Day 3</span>
                            </label>
                        </div>
                    </div>
                </div>
                {message && (
                    <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register & Mark Attendance'}
                </button>
            </form>
        </div>
    );
}