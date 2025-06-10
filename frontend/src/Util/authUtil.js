import axios from 'axios';
import jwt_decode from 'jwt-decode'; // You may need to install this: npm install jwt-decode

// Set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login handler for both users and drivers
export const loginUser = async (credentials, endpoint) => {
  try {
    const response = await axios.post(`http://localhost:5000/api/${endpoint}/login`, credentials);
    const { token } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Decode token to get user/driver data including role
    const decoded = jwt_decode(token);
    localStorage.setItem('userRole', decoded.role);
    
    // Set auth token in axios headers
    setAuthToken(token);
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Authentication failed' 
    };
  }
};

// Check if token is valid
export const checkAuthToken = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return false;
  }
  
  try {
    // Decode token and check expiration
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token expired, remove from storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setAuthToken(false);
      return false;
    }
    
    // Set auth token in axios headers
    setAuthToken(token);
    return true;
  } catch (error) {
    // Invalid token format
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setAuthToken(false);
    return false;
  }
};

// Logout function
export const logoutUser = () => {
  // Remove token from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  
  // Remove auth header for future requests
  setAuthToken(false);
};