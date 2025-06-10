const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Driver Registration Route
router.post('/register', async (req, res) => {
  const { name, email, password, licenseNumber, vehicleInfo } = req.body;

  try {
    const driversCollection = req.db.collection('drivers');

    // Check if driver already exists
    const existingDriver = await driversCollection.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new driver
    const newDriver = { 
      name, 
      email, 
      password: hashedPassword,
      licenseNumber,
      vehicleInfo,
      isApproved: false, // Drivers may need approval before they can start
      dateRegistered: new Date()
    };
    
    await driversCollection.insertOne(newDriver);

    res.status(201).json({ message: 'Driver registered successfully. Awaiting approval.' });
  } catch (error) {
    console.error("Driver registration error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Admin route to approve a driver
router.patch('/approve/:driverId', async (req, res) => {
    try {
      const driversCollection = req.db.collection('drivers');
      
      // In a real app, you would check if the requester is an admin
      // For testing purposes, we'll skip that check
      
      const result = await driversCollection.updateOne(
        { _id: new require('mongodb').ObjectId(req.params.driverId) },
        { $set: { isApproved: true } }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      res.json({ message: 'Driver approved successfully' });
    } catch (error) {
      console.error("Driver approval error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Helper route to find a driver by email (for testing)
router.get('/find-by-email', async (req, res) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const driversCollection = req.db.collection('drivers');
      const driver = await driversCollection.findOne({ email });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      
      res.json({ driverId: driver._id });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
// Driver Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const driversCollection = req.db.collection('drivers');

    // Check if driver exists
    const driver = await driversCollection.findOne({ email });
    if (!driver) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if driver is approved
    if (!driver.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    // Create JWT token with role
    const token = jwt.sign(
      { 
        userId: driver._id, 
        email: driver.email,
        role: 'driver' // Adding role to differentiate from regular users
      },
      process.env.SECRET_KEY || 'fallbacksecretkey',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Driver login error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;