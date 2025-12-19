import React, { useState, useRef } from 'react';
import api from '../services/api';
import { verifyLocation } from '../utils/locationVerification';

const RegistrationTab = () => {
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        category: '',
        department: '',
        institution: '',
        institutionType: '',
        daysOfParticipation: '',
        paymentMethod: '',
        transactionId: '',
        paymentScreenshot: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            paymentScreenshot: e.target.files[0],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Verify location first
            const locationCheck = await verifyLocation();
            
            if (!locationCheck.isValid) {
                alert(locationCheck.message);
                setLoading(false);
                return;
            }

            // Location verified, proceed with registration
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            await api.post('/registration', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Registration successful!');
            setFormData({
                name: '',
                email: '',
                mobileNumber: '',
                category: '',
                department: '',
                institution: '',
                institutionType: '',
                daysOfParticipation: '',
                paymentMethod: '',
                transactionId: '',
                paymentScreenshot: null,
            });
            if (fileRef.current) fileRef.current.value = null;
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>New Registration (Onsite)</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <input type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} required />
                  <select name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">Select Category</option>
                      <option value="Faculty">Faculty</option>
                      <option value="UG Student">UG Student</option>
                      <option value="PG Student">PG Student</option>
                      <option value="PhD Scholar">PhD Scholar</option>
                      <option value="Research Scholar">Research Scholar</option>
                      <option value="Innovator">Innovator</option>
                      <option value="Startup Member">Startup Member</option>
                      <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
                  <input type="text" name="institution" placeholder="Institution/Organization" value={formData.institution} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <select name="institutionType" value={formData.institutionType} onChange={handleChange} required>
                      <option value="">Select Institution Type</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Arts & Science">Arts & Science</option>
                      <option value="Polytechnic">Polytechnic</option>
                      <option value="Research Institute">Research Institute</option>
                      <option value="Industry">Industry</option>
                      <option value="Startup">Startup</option>
                      <option value="Other">Other</option>
                  </select>
                  <input type="text" name="daysOfParticipation" placeholder="Days of Participation" value={formData.daysOfParticipation} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                      <option value="">Select Payment Method</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Card">Card</option>
                      <option value="Others">Others</option>
                  </select>
                  <input type="text" name="transactionId" placeholder="Transaction ID" value={formData.transactionId} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <input ref={fileRef} type="file" name="paymentScreenshot" onChange={handleFileChange} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying Location...' : 'Register & Mark Attendance'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationTab;