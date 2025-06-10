const express = require('express');
const { getDb } = require('../server');  // Import getDb from server.js
const router = express.Router();

// Ride creation route
router.post('/create', async (req, res) => {
  try {
    const { pickupPoint, dropPoint, vehicleType, passengersCount } = req.body;

    // Validate incoming data
    if (!pickupPoint || !dropPoint || !vehicleType || !passengersCount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get the db object
    const db = getDb();
    const ridesCollection = db.collection('rides');
    const ride = {
      pickupPoint,
      dropPoint,
      vehicleType,
      passengersCount,
      createdAt: new Date(),
    };

    // Insert the ride into the database
    const result = await ridesCollection.insertOne(ride);

    if (result.acknowledged) {
      res.status(201).json({ message: 'Ride created successfully', ride: result.ops[0] });
    } else {
      throw new Error('Failed to create ride');
    }
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Error creating ride', error: error.message });
  }
});

// Get all rides route (Optional, for testing purposes)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const ridesCollection = db.collection('rides');
    const rides = await ridesCollection.find({}).toArray();
    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Error fetching rides', error: error.message });
  }
});

module.exports = router;
