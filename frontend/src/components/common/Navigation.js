import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCar, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/login');
  };
// Continuing src/components/common/Navigation.js
return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <FaCar style={{ marginRight: '8px' }} />
          RideGroup
        </Link>
        
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/bookings" className="nav-link">My Bookings</Link>
              <div className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <FaSignOutAlt style={{ marginRight: '5px' }} />
                Logout
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <FaSignInAlt style={{ marginRight: '5px' }} />
                Login
              </Link>
              <Link to="/register" className="nav-link">
                <FaUserPlus style={{ marginRight: '5px' }} />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;