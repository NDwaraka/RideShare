import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const UserLogin = () => {
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
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      
      // Store token in localStorage
      localStorage.setItem('authToken', res.data.token);
      
      // Display success message (optional)
      alert('Login successful!');
      
      // Redirect to dashboard
      navigate('/dashboard');
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
        <h2 className="auth-title">Welcome Back</h2>
        
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
                Login
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;