const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'fallbacksecretkey');
    req.user = {
      userId: new ObjectId(decoded.userId)
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create a new ride with multiple stops
router.post('/', auth, async (req, res) => {
  try {
    console.log('Incoming request body:', req.body); // Log the incoming request
    const db = req.db;
    
    // Validate required fields with more detailed errors
    const requiredFields = {
      pickups: 'Pickup locations',
      dropoffs: 'Drop-off locations',
      scheduled_date: 'Date',
      scheduled_time: 'Time',
      passengerCount: 'Number of passengers',
      vehicleType: 'Vehicle type'
    };
    
    const missingFields = Object.keys(requiredFields).filter(field => {
      // For arrays, check if they exist and are not empty
      if (field === 'pickups' || field === 'dropoffs') {
        return !req.body[field] || !Array.isArray(req.body[field]) || req.body[field].length === 0;
      }
      return !req.body[field];
    });
    
    // if (missingFields.length > 0) {
    //   return res.status(400).json({
    //     message: 'Missing required fields',
    //     missing: missingFields.map(f => requiredFields[f])
    //   });
    // }

    // Validate pickup and dropoff structures
    const invalidPickups = req.body.pickups.filter(pickup => !validateLocation(pickup));
    if (invalidPickups.length > 0) {
      return res.status(400).json({ message: 'One or more pickup locations are invalid' });
    }
    
    const invalidDropoffs = req.body.dropoffs.filter(dropoff => !validateLocation(dropoff));
    if (invalidDropoffs.length > 0) {
      return res.status(400).json({ message: 'One or more drop-off locations are invalid' });
    }

    // Process and sanitize pickups
    const processedPickups = req.body.pickups.map(pickup => ({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(pickup.location.coordinates[0]),
          parseFloat(pickup.location.coordinates[1])
        ]
      },
      address: String(pickup.address)
    }));

    // Process and sanitize dropoffs
    const processedDropoffs = req.body.dropoffs.map(dropoff => ({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(dropoff.location.coordinates[0]),
          parseFloat(dropoff.location.coordinates[1])
        ]
      },
      address: String(dropoff.address)
    }));

    // Create ride object with multiple stops
    const ride = {
      userId: req.user.userId,
      pickups: processedPickups,
      dropoffs: processedDropoffs,
      // Keep startLocation and endLocation for backward compatibility
      startLocation: processedPickups[0].location,
      endLocation: processedDropoffs[0].location,
      startAddress: processedPickups[0].address,
      endAddress: processedDropoffs[0].address,
      scheduled_date: new Date(req.body.scheduled_date).toISOString(),
      scheduled_time: String(req.body.scheduled_time),
      passengerCount: parseInt(req.body.passengerCount, 10),
      vehicleType: String(req.body.vehicleType),
      price: parseFloat(req.body.price),
      distance: parseFloat(req.body.distance),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Prepared ride object:', ride); // Log before insertion
    
    const result = await db.collection('rides').insertOne(ride);
    
    res.status(201).json({ 
      message: 'Ride created successfully', 
      rideId: result.insertedId,
      ride: ride // Return the created ride for debugging
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to validate location object structure
function validateLocation(locationObj) {
  return locationObj && 
         locationObj.location && 
         locationObj.location.coordinates && 
         Array.isArray(locationObj.location.coordinates) &&
         locationObj.location.coordinates.length === 2 &&
         locationObj.address;
}

// For backward compatibility - handles the old route format too
router.post('/legacy', auth, async (req, res) => {
  try {
    console.log('Incoming legacy request body:', req.body);
    const db = req.db;
    
    // Validate required fields with more detailed errors
    const requiredFields = {
      startLocation: 'Pickup location',
      endLocation: 'Drop-off location',
      startAddress: 'Pickup address',
      endAddress: 'Drop-off address',
      scheduled_date: 'Date',
      scheduled_time: 'Time',
      passengerCount: 'Number of passengers',
      vehicleType: 'Vehicle type'
    };
    
    // const missingFields = Object.keys(requiredFields).filter(field => !req.body[field]);
    // if (missingFields.length > 0) {
    //   return res.status(400).json({
    //     message: 'Missing required fields',
    //     missing: missingFields.map(f => requiredFields[f])
    //   });
    // }

    // Validate GeoJSON structure
    if (!req.body.startLocation.coordinates || !Array.isArray(req.body.startLocation.coordinates) ||
        !req.body.endLocation.coordinates || !Array.isArray(req.body.endLocation.coordinates)) {
      return res.status(400).json({ message: 'Invalid location format' });
    }

    // Create ride object with more validation
    const ride = {
      userId: req.user.userId,
      startLocation: {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.startLocation.coordinates[0]),
          parseFloat(req.body.startLocation.coordinates[1])
        ]
      },
      endLocation: {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.endLocation.coordinates[0]),
          parseFloat(req.body.endLocation.coordinates[1])
        ]
      },
      // Add pickup and dropoff arrays with single entry each
      pickups: [{
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(req.body.startLocation.coordinates[0]),
            parseFloat(req.body.startLocation.coordinates[1])
          ]
        },
        address: String(req.body.startAddress)
      }],
      dropoffs: [{
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(req.body.endLocation.coordinates[0]),
            parseFloat(req.body.endLocation.coordinates[1])
          ]
        },
        address: String(req.body.endAddress)
      }],
      startAddress: String(req.body.startAddress),
      endAddress: String(req.body.endAddress),
      scheduled_date: new Date(req.body.scheduled_date).toISOString(),
      scheduled_time: String(req.body.scheduled_time),
      passengerCount: parseInt(req.body.passengerCount, 10),
      vehicleType: String(req.body.vehicleType),
      price: parseFloat(req.body.price),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Prepared legacy ride object:', ride);
    
    const result = await db.collection('rides').insertOne(ride);
    
    res.status(201).json({ 
      message: 'Ride created successfully', 
      rideId: result.insertedId,
      ride: ride
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all user rides - update to handle both old and new formats
router.get('/user', auth, async (req, res) => {
  try {
    const rides = await req.db.collection('rides')
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(rides);
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific ride by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    const ride = await db.collection('rides').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if the ride belongs to the requesting user
    if (!ride.userId.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to access this ride' });
    }
    
    res.json(ride);
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ride status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const db = req.db;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const ride = await db.collection('rides').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if the ride belongs to the requesting user
    if (!ride.userId.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }
    
    await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    res.json({ message: 'Ride status updated successfully' });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add this to rides.js to better process routes with multiple stops

// Modified route to handle optimized routes
router.post('/optimized', auth, async (req, res) => {
  try {
    console.log('Incoming optimized route request:', req.body);
    const db = req.db;
    
    // Validate required fields with more detailed errors
    const requiredFields = {
      pickups: 'Pickup locations',
      dropoffs: 'Drop-off locations',
      routeSequence: 'Route sequence', // This is a new field to specify the order of stops
      scheduled_date: 'Date',
      scheduled_time: 'Time',
      passengerCount: 'Number of passengers',
      vehicleType: 'Vehicle type'
    };
    
    const missingFields = Object.keys(requiredFields).filter(field => {
      // For arrays, check if they exist and are not empty
      if (field === 'pickups' || field === 'dropoffs' || field === 'routeSequence') {
        return !req.body[field] || !Array.isArray(req.body[field]) || req.body[field].length === 0;
      }
      return !req.body[field];
    });
    
    // if (missingFields.length > 0) {
    //   return res.status(400).json({
    //     message: 'Missing required fields',
    //     missing: missingFields.map(f => requiredFields[f])
    //   });
    // }

    // Validate pickup and dropoff structures
    const invalidPickups = req.body.pickups.filter(pickup => !validateLocation(pickup));
    if (invalidPickups.length > 0) {
      return res.status(400).json({ message: 'One or more pickup locations are invalid' });
    }
    
    const invalidDropoffs = req.body.dropoffs.filter(dropoff => !validateLocation(dropoff));
    if (invalidDropoffs.length > 0) {
      return res.status(400).json({ message: 'One or more drop-off locations are invalid' });
    }

    // Process and sanitize pickups
    const processedPickups = req.body.pickups.map(pickup => ({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(pickup.location.coordinates[0]),
          parseFloat(pickup.location.coordinates[1])
        ]
      },
      address: String(pickup.address)
    }));

    // Process and sanitize dropoffs
    const processedDropoffs = req.body.dropoffs.map(dropoff => ({
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(dropoff.location.coordinates[0]),
          parseFloat(dropoff.location.coordinates[1])
        ]
      },
      address: String(dropoff.address)
    }));

    // Process the route sequence - an array of indices for the stops in order
    const routeSequence = req.body.routeSequence.map(index => parseInt(index, 10));
    
    // Create ride object with multiple stops and route sequence
    const ride = {
      userId: req.user.userId,
      pickups: processedPickups,
      dropoffs: processedDropoffs,
      routeSequence: routeSequence, // Store the optimized route sequence
      // Keep startLocation and endLocation for backward compatibility
      startLocation: processedPickups[0].location,
      endLocation: processedDropoffs[0].location,
      startAddress: processedPickups[0].address,
      endAddress: processedDropoffs[0].address,
      scheduled_date: new Date(req.body.scheduled_date).toISOString(),
      scheduled_time: String(req.body.scheduled_time),
      passengerCount: parseInt(req.body.passengerCount, 10),
      vehicleType: String(req.body.vehicleType),
      price: parseFloat(req.body.price),
      distance: parseFloat(req.body.distance),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Prepared optimized ride object:', ride);
    
    const result = await db.collection('rides').insertOne(ride);
    
    res.status(201).json({ 
      message: 'Optimized route created successfully', 
      rideId: result.insertedId,
      ride: ride
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;