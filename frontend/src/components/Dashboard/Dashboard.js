import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaDirections, FaClock, FaCalendarAlt, FaSearch, FaUsers, FaCar, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  // Existing state variables
  const [mapLoaded, setMapLoaded] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [mapError, setMapError] = useState(null);

  // New state for ride with multiple stops
  const [newRide, setNewRide] = useState({
    stops: [
      // Initial first pickup
      {
        type: 'pickup',
        location: null,
        address: '',
        marker: null,
      },
      // Initial first dropoff
      {
        type: 'dropoff',
        location: null,
        address: '',
        marker: null,
      }
    ],
    date: '',
    time: '',
    passengerCount: 1, 
    vehicleType: 'sedan',
    price: 0,
    distance: 0,
  });
  
  // Vehicle type options with capacity and base price per km
  const vehicleOptions = [
    { id: 'bike', name: 'Bike', capacity: 1, pricePerKm: 1.5, basePrice: 5 },
    { id: 'sedan', name: 'Sedan Car', capacity: 4, pricePerKm: 2, basePrice: 10 },
    { id: 'suv', name: 'SUV', capacity: 6, pricePerKm: 2.5, basePrice: 15 },
    { id: 'minivan', name: 'Mini Van', capacity: 8, pricePerKm: 3, basePrice: 20 },
    { id: 'bus', name: 'Bus', capacity: 20, pricePerKm: 4, basePrice: 50 },
  ];

  // Refs
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routeLinesRef = useRef([]);
  const L = useRef(null);

  // Map initialization
  useEffect(() => {
    const loadMap = async () => {
      try {
        // Load Leaflet from CDN if not already loaded
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
          script.crossOrigin = '';
          document.head.appendChild(script);
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
          
          // Wait for script to load
          await new Promise(resolve => {
            script.onload = resolve;
          });
        }
        
        // Create map if container exists
        if (mapContainerRef.current && !mapRef.current) {
          L.current = window.L;
          mapRef.current = L.current.map(mapContainerRef.current).setView([40.7128, -74.0060], 13);
          
          L.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapRef.current);
          
          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Error loading map:", error);
        setMapError("Failed to load map. Please refresh the page.");
      }
    };
    
    loadMap();
    fetchBookings();
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add function to draw routes between multiple stops
  // Update the drawRoutes function in Dashboard.js to connect pickups first, then dropoffs
const drawRoutes = () => {
  if (!L.current || !mapRef.current) return;
  
  // Clear existing route lines
  routeLinesRef.current.forEach(line => {
    if (line) line.remove();
  });
  routeLinesRef.current = [];
  
  // Get all valid stops with locations
  const validStops = newRide.stops.filter(stop => stop.location !== null);
  
  if (validStops.length < 2) return;
  
  // Set boundaries to fit all markers
  const bounds = L.current.latLngBounds([]);
  
  // Add all points to bounds
  validStops.forEach(stop => {
    const latLng = L.current.latLng(
      stop.location.coordinates[1],
      stop.location.coordinates[0]
    );
    bounds.extend(latLng);
  });
  
  // Separate pickups and dropoffs
  const pickups = validStops.filter(stop => stop.type === 'pickup');
  const dropoffs = validStops.filter(stop => stop.type === 'dropoff');
  
  let totalDistance = 0;
  
  // First connect all pickup points in sequence (if more than one)
  for (let i = 0; i < pickups.length - 1; i++) {
    const start = pickups[i];
    const end = pickups[i + 1];
    
    const startLatLng = L.current.latLng(
      start.location.coordinates[1],
      start.location.coordinates[0]
    );
    
    const endLatLng = L.current.latLng(
      end.location.coordinates[1],
      end.location.coordinates[0]
    );
    
    // Calculate distance for this segment
    const segmentDistanceInMeters = startLatLng.distanceTo(endLatLng);
    const segmentDistanceInKm = segmentDistanceInMeters / 1000;
    totalDistance += segmentDistanceInKm;
    
    // Create a polyline between these points (green for pickup connections)
    const routeLine = L.current.polyline([startLatLng, endLatLng], {
      color: '#28a745', // Green color for pickup connections
      weight: 4,
      opacity: 0.6,
      dashArray: '5, 5' // Dashed line for pickup-to-pickup
    }).addTo(mapRef.current);
    
    // Add distance info to the route
    L.current.marker(
      [(startLatLng.lat + endLatLng.lat) / 2, (startLatLng.lng + endLatLng.lng) / 2],
      { opacity: 0.7 }
    ).addTo(mapRef.current)
    .bindTooltip(`${segmentDistanceInKm.toFixed(2)} km`, { permanent: true, direction: 'top' });
    
    routeLinesRef.current.push(routeLine);
  }
  
  // Then connect last pickup to first dropoff
  if (pickups.length > 0 && dropoffs.length > 0) {
    const lastPickup = pickups[pickups.length - 1];
    const firstDropoff = dropoffs[0];
    
    const startLatLng = L.current.latLng(
      lastPickup.location.coordinates[1],
      lastPickup.location.coordinates[0]
    );
    
    const endLatLng = L.current.latLng(
      firstDropoff.location.coordinates[1],
      firstDropoff.location.coordinates[0]
    );
    
    // Calculate distance for this segment
    const segmentDistanceInMeters = startLatLng.distanceTo(endLatLng);
    const segmentDistanceInKm = segmentDistanceInMeters / 1000;
    totalDistance += segmentDistanceInKm;
    
    // Create a polyline between these points (blue for main route)
    const routeLine = L.current.polyline([startLatLng, endLatLng], {
      color: '#3388ff', // Blue color for main route
      weight: 4,
      opacity: 0.8
    }).addTo(mapRef.current);
    
    // Add distance info to the route
    L.current.marker(
      [(startLatLng.lat + endLatLng.lat) / 2, (startLatLng.lng + endLatLng.lng) / 2],
      { opacity: 0.7 }
    ).addTo(mapRef.current)
    .bindTooltip(`${segmentDistanceInKm.toFixed(2)} km`, { permanent: true, direction: 'top' });
    
    routeLinesRef.current.push(routeLine);
  }
  
  // Finally connect all dropoff points in sequence
  for (let i = 0; i < dropoffs.length - 1; i++) {
    const start = dropoffs[i];
    const end = dropoffs[i + 1];
    
    const startLatLng = L.current.latLng(
      start.location.coordinates[1],
      start.location.coordinates[0]
    );
    
    const endLatLng = L.current.latLng(
      end.location.coordinates[1],
      end.location.coordinates[0]
    );
    
    // Calculate distance for this segment
    const segmentDistanceInMeters = startLatLng.distanceTo(endLatLng);
    const segmentDistanceInKm = segmentDistanceInMeters / 1000;
    totalDistance += segmentDistanceInKm;
    
    // Create a polyline between these points (red for dropoff connections)
    const routeLine = L.current.polyline([startLatLng, endLatLng], {
      color: '#dc3545', // Red color for dropoff connections
      weight: 4,
      opacity: 0.6,
      dashArray: '5, 5' // Dashed line for dropoff-to-dropoff
    }).addTo(mapRef.current);
    
    // Add distance info to the route
    L.current.marker(
      [(startLatLng.lat + endLatLng.lat) / 2, (startLatLng.lng + endLatLng.lng) / 2],
      { opacity: 0.7 }
    ).addTo(mapRef.current)
    .bindTooltip(`${segmentDistanceInKm.toFixed(2)} km`, { permanent: true, direction: 'top' });
    
    routeLinesRef.current.push(routeLine);
  }
  // Add this function to Dashboard.js to generate a route sequence

// Generate an optimized route sequence
const generateRouteSequence = () => {
  // Get all valid stops
  const validStops = newRide.stops.filter(stop => stop.location !== null);
  
  // Separate into pickups and dropoffs
  const pickups = validStops.filter(stop => stop.type === 'pickup');
  const dropoffs = validStops.filter(stop => stop.type === 'dropoff');
  
  // Check if we have enough stops
  if (pickups.length === 0 || dropoffs.length === 0) {
    return null;
  }
  
  // Strategy 1: All pickups first, then all dropoffs
  // Find indices of all stops in the original array to maintain references
  const routeSequence = [];
  
  // Add all pickups first
  pickups.forEach(pickup => {
    const index = newRide.stops.findIndex(stop => 
      stop === pickup || (
        stop.type === pickup.type && 
        stop.address === pickup.address && 
        stop.location && pickup.location &&
        stop.location.coordinates[0] === pickup.location.coordinates[0] &&
        stop.location.coordinates[1] === pickup.location.coordinates[1]
      )
    );
    if (index !== -1) routeSequence.push(index);
  });
  
  // Then add all dropoffs
  dropoffs.forEach(dropoff => {
    const index = newRide.stops.findIndex(stop => 
      stop === dropoff || (
        stop.type === dropoff.type && 
        stop.address === dropoff.address && 
        stop.location && dropoff.location &&
        stop.location.coordinates[0] === dropoff.location.coordinates[0] &&
        stop.location.coordinates[1] === dropoff.location.coordinates[1]
      )
    );
    if (index !== -1) routeSequence.push(index);
  });
  
  return routeSequence;
};

// Update the handleSubmitRide function to include the route sequence
const handleSubmitRide = async (e) => {
  e.preventDefault();
  
  // Basic validation
  const pickupStops = newRide.stops.filter(stop => stop.type === 'pickup');
  const dropoffStops = newRide.stops.filter(stop => stop.type === 'dropoff');
  
  if (pickupStops.length === 0 || dropoffStops.length === 0) {
    setMessage({
      type: 'error',
      text: 'You need at least one pickup and one drop-off location'
    });
    return;
  }
  
  // Check that all stops have locations
  const invalidStops = newRide.stops.filter(stop => !stop.location);
  if (invalidStops.length > 0) {
    setMessage({
      type: 'error',
      text: 'All stops must have valid locations. Please search for addresses.'
    });
    return;
  }
  
  // Generate route sequence
  const routeSequence = generateRouteSequence();
  if (!routeSequence || routeSequence.length < 2) {
    setMessage({
      type: 'error',
      text: 'Failed to create a valid route sequence.'
    });
    return;
  }
  
  // Validate other required fields
  if (!newRide.date || !newRide.time || !newRide.vehicleType) {
    setMessage({
      type: 'error',
      text: 'Please fill in all required fields (date, time, vehicle type)'
    });
    return;
  }
  
  // Validate passenger count against vehicle capacity
  const selectedVehicle = vehicleOptions.find(v => v.id === newRide.vehicleType);
  if (newRide.passengerCount > selectedVehicle.capacity) {
    setMessage({
      type: 'error',
      text: `The selected vehicle (${selectedVehicle.name}) can only accommodate ${selectedVehicle.capacity} passengers.`
    });
    return;
  }
  
  setLoading(true);
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage({ type: 'error', text: 'You must be logged in' });
      setLoading(false);
      return;
    }
    
    // Format pickup and dropoff stops for the API
    const pickups = pickupStops.map(stop => ({
      location: stop.location,
      address: stop.address
    }));
    
    const dropoffs = dropoffStops.map(stop => ({
      location: stop.location,
      address: stop.address
    }));
    
    // Prepare the request payload
    const payload = {
      pickups,
      dropoffs,
      routeSequence, // Add the route sequence
      scheduled_date: newRide.date,
      scheduled_time: newRide.time,
      passengerCount: parseInt(newRide.passengerCount, 10),
      vehicleType: newRide.vehicleType,
      price: newRide.price,
      distance: newRide.distance
    };
    
    console.log('Sending payload with route sequence:', payload);
    
    // Use the new optimized endpoint
    const response = await axios.post('http://localhost:5000/api/rides/optimized', payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    setMessage({ type: 'success', text: response.data.message });
    
    // Reset form
    handleResetLocations();
    setNewRide(prev => ({
      ...prev,
      date: '',
      time: '',
      passengerCount: 1,
      vehicleType: 'sedan',
      price: 0,
      distance: 0
    }));
    
    // Refresh bookings after successful submission
    fetchBookings();
    
  } catch (error) {
    console.error('Full error details:', {
      error: error,
      response: error.response,
      config: error.config
    });
    
    let errorMessage = 'Booking failed. Please try again.';
    if (error.response) {
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `Server responded with ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    }
    
    setMessage({
      type: 'error',
      text: errorMessage
    });
  } finally {
    setLoading(false);
  }
};
  // Update total distance in state
  const roundedTotalDistance = Math.round(totalDistance * 100) / 100;
  setNewRide(prev => ({
    ...prev,
    distance: roundedTotalDistance
  }));
  
  // Calculate price based on total distance
  calculatePrice(roundedTotalDistance);
  
  // Fit map to show all markers
  mapRef.current.fitBounds(bounds, { padding: [50, 50] });
};

  // Calculate price based on vehicle type and distance
  const calculatePrice = (distance) => {
    const selectedVehicle = vehicleOptions.find(v => v.id === newRide.vehicleType);
    if (!selectedVehicle) return;
    
    // Calculate price: base price + (distance * price per km)
    const calculatedPrice = selectedVehicle.basePrice + (distance * selectedVehicle.pricePerKm);
    
    // Apply a small surge pricing based on passenger count (optional)
    const passengerFactor = 1 + ((newRide.passengerCount - 1) * 0.05);
    
    // Round to 2 decimal places
    const finalPrice = Math.round((calculatedPrice * passengerFactor) * 100) / 100;
    
    setNewRide(prev => ({
      ...prev,
      price: finalPrice
    }));
  };

  // Handle form input changes for basic ride details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewRide(prev => {
      const updatedRide = { ...prev, [name]: value };
      
      // Recalculate price when passenger count or vehicle type changes
      if ((name === 'passengerCount' || name === 'vehicleType') && prev.distance > 0) {
        setTimeout(() => calculatePrice(prev.distance), 0);
      }
      
      return updatedRide;
    });
  };

  // Handle input change for a specific stop
  const handleStopInputChange = (index, e) => {
    const { value } = e.target;
    
    setNewRide(prev => {
      const updatedStops = [...prev.stops];
      updatedStops[index] = {
        ...updatedStops[index],
        address: value
      };
      
      return {
        ...prev,
        stops: updatedStops
      };
    });
  };

  // Geocode an address for a specific stop
  const geocodeStop = async (index) => {
    const stopAddress = newRide.stops[index].address;
    
    if (!stopAddress.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter an address first'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Use Nominatim for geocoding
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: stopAddress,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'RideBookingApp/1.0'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        const coordinates = {
          type: 'Point',
          coordinates: [parseFloat(location.lon), parseFloat(location.lat)]
        };
        
        // Update stop in state
        setNewRide(prev => {
          const updatedStops = [...prev.stops];
          
          // Remove existing marker if any
          if (updatedStops[index].marker && mapRef.current) {
            updatedStops[index].marker.remove();
          }
          
          // Create marker with style based on stop type
          const stopType = updatedStops[index].type;
          const markerColor = stopType === 'pickup' ? 'green' : 'red';
          const markerLabel = stopType === 'pickup' ? 'P' : 'D';
          const markerNumber = getStopTypeCount(updatedStops, stopType, index);
          
          const newMarker = L.current.marker([location.lat, location.lon], {
            icon: L.current.divIcon({
              className: `${stopType}-marker`,
              html: `<div class="marker ${stopType}" style="background-color: ${markerColor};">${markerLabel}${markerNumber}</div>`,
              iconSize: [30, 30]
            })
          }).addTo(mapRef.current);
          
          // Add popup with address
          newMarker.bindPopup(`<b>${stopType === 'pickup' ? 'Pickup' : 'Drop-off'} ${markerNumber}:</b> ${stopAddress}`).openPopup();
          
          updatedStops[index] = {
            ...updatedStops[index],
            location: coordinates,
            address: stopAddress,
            marker: newMarker
          };
          
          // Center map on marker
          mapRef.current.setView([location.lat, location.lon], 14);
          
          // Draw routes if we have at least 2 valid stops
          setTimeout(() => drawRoutes(), 100);
          
          return {
            ...prev,
            stops: updatedStops
          };
        });
      } else {
        setMessage({
          type: 'error',
          text: `Could not find location for "${stopAddress}"`
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to search for the address. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to count stops of the same type before this index
  const getStopTypeCount = (stops, type, currentIndex) => {
    return stops.filter((stop, idx) => stop.type === type && idx <= currentIndex).length;
  };

  // Add a new stop (either pickup or dropoff)
  const addStop = (type) => {
    setNewRide(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          type,
          location: null,
          address: '',
          marker: null,
        }
      ]
    }));
  };

  // Remove a stop
  const removeStop = (index) => {
    if (newRide.stops.length <= 2) {
      setMessage({
        type: 'error',
        text: 'You need at least one pickup and one drop-off location'
      });
      return;
    }
    
    setNewRide(prev => {
      const updatedStops = [...prev.stops];
      
      // Remove marker from map if it exists
      if (updatedStops[index].marker) {
        updatedStops[index].marker.remove();
      }
      
      // Remove the stop
      updatedStops.splice(index, 1);
      
      // Make sure we still have at least one pickup and one dropoff
      const hasPickup = updatedStops.some(stop => stop.type === 'pickup');
      const hasDropoff = updatedStops.some(stop => stop.type === 'dropoff');
      
      if (!hasPickup) {
        updatedStops.push({
          type: 'pickup',
          location: null,
          address: '',
          marker: null,
        });
      }
      
      if (!hasDropoff) {
        updatedStops.push({
          type: 'dropoff',
          location: null,
          address: '',
          marker: null,
        });
      }
      
      // Redraw routes
      setTimeout(() => drawRoutes(), 100);
      
      return {
        ...prev,
        stops: updatedStops
      };
    });
  };

  // Reset all locations
  const handleResetLocations = () => {
    // Remove all markers from map
    newRide.stops.forEach(stop => {
      if (stop.marker) {
        stop.marker.remove();
      }
    });
    
    // Clear route lines
    routeLinesRef.current.forEach(line => {
      if (line) line.remove();
    });
    routeLinesRef.current = [];
    
    // Reset locations in state
    setNewRide(prev => ({
      ...prev,
      stops: [
        {
          type: 'pickup',
          location: null,
          address: '',
          marker: null,
        },
        {
          type: 'dropoff',
          location: null,
          address: '',
          marker: null,
        }
      ],
      distance: 0,
      price: 0
    }));
    
    // Reset map view
    if (mapRef.current) {
      mapRef.current.setView([40.7128, -74.0060], 13);
    }
  };

  // Submit ride with multiple stops
  const handleSubmitRide = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const pickupStops = newRide.stops.filter(stop => stop.type === 'pickup');
    const dropoffStops = newRide.stops.filter(stop => stop.type === 'dropoff');
    
    if (pickupStops.length === 0 || dropoffStops.length === 0) {
      setMessage({
        type: 'error',
        text: 'You need at least one pickup and one drop-off location'
      });
      return;
    }
    
    // Check that all stops have locations
    const invalidStops = newRide.stops.filter(stop => !stop.location);
    if (invalidStops.length > 0) {
      setMessage({
        type: 'error',
        text: 'All stops must have valid locations. Please search for addresses.'
      });
      return;
    }
    
    // Validate other required fields
    if (!newRide.date || !newRide.time || !newRide.vehicleType) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields (date, time, vehicle type)'
      });
      return;
    }
    
    // Validate passenger count against vehicle capacity
    const selectedVehicle = vehicleOptions.find(v => v.id === newRide.vehicleType);
    if (newRide.passengerCount > selectedVehicle.capacity) {
      setMessage({
        type: 'error',
        text: `The selected vehicle (${selectedVehicle.name}) can only accommodate ${selectedVehicle.capacity} passengers.`
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'You must be logged in' });
        setLoading(false);
        return;
      }
      
      // Format pickup and dropoff stops for the API
      const pickups = pickupStops.map(stop => ({
        location: stop.location,
        address: stop.address
      }));
      
      const dropoffs = dropoffStops.map(stop => ({
        location: stop.location,
        address: stop.address
      }));
      
      // Prepare the request payload
      const payload = {
        pickups,
        dropoffs,
        scheduled_date: newRide.date,
        scheduled_time: newRide.time,
        passengerCount: parseInt(newRide.passengerCount, 10),
        vehicleType: newRide.vehicleType,
        price: newRide.price,
        distance: newRide.distance
      };
      
      console.log('Sending payload:', payload);
      
      const response = await axios.post('http://localhost:5000/api/rides', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage({ type: 'success', text: response.data.message });
      
      // Reset form
      handleResetLocations();
      setNewRide(prev => ({
        ...prev,
        date: '',
        time: '',
        passengerCount: 1,
        vehicleType: 'sedan',
        price: 0,
        distance: 0
      }));
      
      // Refresh bookings after successful submission
      fetchBookings();
      
    } catch (error) {
      console.error('Full error details:', {
        error: error,
        response: error.response,
        config: error.config
      });
      
      let errorMessage = 'Booking failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server responded with ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response received from server';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings from server
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/rides/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load your bookings. Please try again later.'
      });
    }
  };

  // Get stop label (e.g., "Pickup 1", "Drop-off 2")
  const getStopLabel = (stop, index) => {
    const count = newRide.stops
      .filter((s, idx) => s.type === stop.type && idx <= index)
      .length;
    return stop.type === 'pickup' ? `Pickup ${count}` : `Drop-off ${count}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button 
            className="close-btn"
            onClick={() => setMessage(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="dashboard-content">
        <div className="map-section">
          <h3>Your Route</h3>
          <div 
            id="map" 
            ref={mapContainerRef} 
            style={{ height: '400px', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            {!mapLoaded && !mapError && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                background: '#f0f0f0' 
              }}>
                Loading map...
              </div>
            )}
            {mapError && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                background: '#fff0f0',
                color: '#d32f2f',
                padding: '20px',
                textAlign: 'center'
              }}>
                {mapError}
              </div>
            )}
          </div>
          <div className="map-instructions">
            <p>Add multiple pickup and drop-off locations for your ride.</p>
            <button 
              type="button" 
              className="btn secondary-btn"
              onClick={handleResetLocations}
            >
              Reset Locations
            </button>
          </div>
        </div>
        
        <div className="booking-form">
          <h3>Book a Ride</h3>
          <form onSubmit={handleSubmitRide}>
            {/* Stop locations */}
            <div className="stops-container">
              <h4>Stops</h4>
              
              {newRide.stops.map((stop, index) => (
                <div key={index} className={`stop-item ${stop.type}`}>
                  <div className="stop-header">
                    <span className="stop-label">{getStopLabel(stop, index)}</span>
                    <button
                      type="button"
                      className="btn delete-btn"
                      onClick={() => removeStop(index)}
                      disabled={newRide.stops.length <= 2}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="form-group">
                    <div className="input-with-button">
                      <input
                        type="text"
                        value={stop.address}
                        onChange={(e) => handleStopInputChange(index, e)}
                        placeholder={`Enter ${stop.type === 'pickup' ? 'pickup' : 'drop-off'} address`}
                        className="form-input"
                      />
                      <button 
                        type="button" 
                        className="btn input-btn"
                        onClick={() => geocodeStop(index)}
                        disabled={loading}
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="add-stops-buttons">
                <button
                  type="button"
                  className="btn add-btn pickup"
                  onClick={() => addStop('pickup')}
                >
                  <FaPlus /> Add Pickup
                </button>
                <button
                  type="button"
                  className="btn add-btn dropoff"
                  onClick={() => addStop('dropoff')}
                >
                  <FaPlus /> Add Drop-off
                </button>
              </div>
            </div>
            
            {/* Other ride details */}
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Date:
              </label>
              <input
                type="date"
                name="date"
                value={newRide.date}
                onChange={handleInputChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaClock /> Time:
              </label>
              <input
                type="time"
                name="time"
                value={newRide.time}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaUsers /> Number of Passengers:
              </label>
              <input
                type="number"
                name="passengerCount"
                value={newRide.passengerCount}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="20"
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaCar /> Vehicle Type:
              </label>
              <select
                name="vehicleType"
                value={newRide.vehicleType}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                {vehicleOptions.map(vehicle => (
                  <option 
                    key={vehicle.id} 
                    value={vehicle.id}
                    disabled={newRide.passengerCount > vehicle.capacity}
                  >
                    {vehicle.name} (up to {vehicle.capacity} passengers)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Display price if available */}
            {newRide.price > 0 && (
              <div className="price-display">
                <h4>Estimated Price: ${newRide.price.toFixed(2)}</h4>
                <p className="price-info">
                  {newRide.distance > 0 && `Total Distance: ${newRide.distance.toFixed(2)} km`}
                </p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-block"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Ride'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="bookings-section">
        <h3>My Bookings</h3>
        {bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-info">
                  <div className="booking-locations">
                    <h4>Pickup Points:</h4>
                    {booking.pickups ? (
                      booking.pickups.map((pickup, index) => (
                        <p key={`pickup-${index}`}><strong>Pickup {index + 1}:</strong> {pickup.address}</p>
                      ))
                    ) : (
                      <p><strong>From:</strong> {booking.startAddress}</p>
                    )}
                    
                    <h4>Drop-off Points:</h4>
                    {booking.dropoffs ? (
                      booking.dropoffs.map((dropoff, index) => (
                        <p key={`dropoff-${index}`}><strong>Drop-off {index + 1}:</strong> {dropoff.address}</p>
                      ))
                    ) : (
                      <p><strong>To:</strong> {booking.endAddress}</p>
                    )}
                  </div>
                  <div className="booking-details">
                    <p><strong>Date:</strong> {new Date(booking.scheduled_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {booking.scheduled_time}</p>
                    <p><strong>Vehicle:</strong> {
                      vehicleOptions.find(v => v.id === booking.vehicleType)?.name || 'Not specified'
                    }</p>
                    <p><strong>Passengers:</strong> {booking.passengerCount || 'Not specified'}</p>
                    {booking.price && <p><strong>Price:</strong> ${booking.price.toFixed(2)}</p>}
                    <p><strong>Status:</strong> <span className={`status-${booking.status?.toLowerCase()}`}>{booking.status}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;