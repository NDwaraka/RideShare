// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import HomePage from './components/home/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import UserLogin from './components/auth/UserLogin';
import UserRegister from './components/auth/UserRegister';
import DriverLogin from './components/auth/DriverLogin';
import DriverRegister from './components/auth/DriverRegister';
import DriverDashboard from './components/Dashboard/DriverDashboard';
import './styles/main.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver-dashboard" 
          element={<ProtectedRoute element={<DriverDashboard />} allowedRole="driver" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;