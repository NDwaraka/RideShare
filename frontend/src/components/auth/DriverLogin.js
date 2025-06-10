import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaSignInAlt, FaCar } from 'react-icons/fa';

const DriverLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('http://localhost:5000/api/drivers/login', form);
      
      // Store token in localStorage
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('userRole', 'driver'); // Store role for frontend routing
      
      // Display success message (optional)
      alert('Login successful!');
      
      // Redirect to driver dashboard
      navigate('/driver-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="auth-title">
          <FaCar style={{ marginRight: '10px' }} />
          Driver Login
        </h2>
        
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
          
          <button 
            type="submit" 
            className="btn btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : (
              <>
                <FaSignInAlt style={{ marginRight: '8px' }} />
                Driver Login
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Need a driver account? <Link to="/driver-register" className="auth-link">Register as Driver</Link>
        </div>
        <div className="auth-footer mt-2">
          <Link to="/login" className="auth-link">Login as User</Link>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;