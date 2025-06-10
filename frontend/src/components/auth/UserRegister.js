import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

const UserRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      
      // Show success message
      alert(res.data.message || 'Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#FEE2E2', 
            color: '#B91C1C', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <FaUser style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '15px', 
                color: '#718096' 
              }} />
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '15px', 
                color: '#718096' 
              }} />
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '15px', 
                color: '#718096' 
              }} />
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '15px', 
                color: '#718096' 
              }} />
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-block"
            disabled={loading}
          >
            {loading ? 'Registering...' : (
              <>
                <FaUserPlus style={{ marginRight: '8px' }} />
                Register
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;