import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCar, FaRoad, FaHistory, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const DriverDashboard = () => {
  const [driverData, setDriverData] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverStatus, setDriverStatus] = useState('offline'); // offline, available, busy
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as a driver
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'driver') {
      navigate('/driver-login');
      return;
    }
    
    // Fetch driver data and available rides
    const fetchData = async () => {
      try {
        // Set up headers with auth token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // For demo purposes, we'll just fetch available rides
        // In a real app, you'd have specific endpoints for driver data
        const ridesRes = await axios.get('http://localhost:5000/api/rides', config);
        
        // Filter rides that need a driver (this would typically be done on the backend)
        const available = ridesRes.data.filter(ride => !ride.driverId);
        setAvailableRides(available);
        
        // Demo driver data
        setDriverData({
          id: '123',
          name: 'John Driver',
          rating: 4.8,
          ridesCompleted: 156,
          earnings: 3240.50
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const toggleDriverStatus = () => {
    if (driverStatus === 'offline') {
      setDriverStatus('available');
    } else {
      setDriverStatus('offline');
    }
  };
  
  const acceptRide = (ride) => {
    // In a real app, you'd make an API call to assign the driver to this ride
    setActiveRide(ride);
    setDriverStatus('busy');
    
    // Remove this ride from available rides
    setAvailableRides(availableRides.filter(r => r._id !== ride._id));
  };
  
  const completeRide = () => {
    // In a real app, you'd make an API call to mark the ride as complete
    setActiveRide(null);
    setDriverStatus('available');
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/driver-login');
  };

  if (loading) {
    return <div className="container text-center py-5">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="container text-center py-5 text-red-600">{error}</div>;
  }

  return (
    <div className="container py-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <button 
          onClick={logout}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>
      
      {/* Driver Status Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <FaUserCircle className="text-5xl text-gray-400 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{driverData.name}</h2>
            <div className="text-sm text-gray-500">Rating: ⭐ {driverData.rating} • {driverData.ridesCompleted} Rides</div>
          </div>
          <div className="ml-auto">
            <div className="text-xl font-semibold">${driverData.earnings.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total Earnings</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">Status: </span>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              driverStatus === 'offline' ? 'bg-gray-200' : 
              driverStatus === 'available' ? 'bg-green-200 text-green-800' : 
              'bg-yellow-200 text-yellow-800'
            }`}>
              {driverStatus.charAt(0).toUpperCase() + driverStatus.slice(1)}
            </span>
          </div>
          
          <button 
            onClick={toggleDriverStatus}
            disabled={driverStatus === 'busy'}
            className={`px-4 py-2 rounded ${
              driverStatus === 'offline' ? 
              'bg-green-600 text-white hover:bg-green-700' : 
              'bg-gray-600 text-white hover:bg-gray-700'
            } ${driverStatus === 'busy' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {driverStatus === 'offline' ? 'Go Online' : 'Go Offline'}
          </button>
        </div>
      </div>
      
      {/* Active Ride Card */}
      {activeRide && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold mb-4">Active Ride</h3>
          <div className="flex items-center mb-3">
            <FaUserCircle className="text-gray-400 mr-2" />
            <div className="font-medium">{activeRide.userName || 'Passenger'}</div>
          </div>
          <div className="flex items-start mb-3">
            <div className="flex flex-col items-center mr-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="w-0.5 h-10 bg-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Pick up</div>
              <div className="font-medium mb-3">{activeRide.startLocation?.address || 'Loading address...'}</div>
              <div className="text-sm text-gray-600 mb-2">Drop off</div>
              <div className="font-medium">{activeRide.endLocation?.address || 'Loading address...'}</div>
            </div>
          </div>
          <button 
            onClick={completeRide}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Complete Ride
          </button>
        </div>
      )}
      
      {/* Available Rides */}
      {driverStatus === 'available' && availableRides.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Available Rides</h3>
          <div className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride._id || ride.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <div className="font-medium">{ride.userName || 'Passenger'}</div>
                  <div className="font-medium text-green-600">${ride.fare || '10.00'}</div>
                </div>
                <div className="flex items-start mb-3">
                  <div className="flex flex-col items-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">From: {ride.startLocation?.address || 'Start location'}</div>
                    <div className="text-gray-600">To: {ride.endLocation?.address || 'End location'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => acceptRide(ride)}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Accept Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Rides Available */}
      {driverStatus === 'available' && availableRides.length === 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <FaRoad className="text-4xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Rides Available</h3>
          <p className="text-gray-600">Check back soon for new ride requests.</p>
        </div>
      )}
      
      {/* Offline Message */}
      {driverStatus === 'offline' && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <FaCar className="text-4xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">You're Currently Offline</h3>
          <p className="text-gray-600">Go online to start accepting rides.</p>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;