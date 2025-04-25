// APIs/user.api.js
const express = require('express');
const { getDB } = require('../config/db.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { sendVerificationEmail } = require('./userVerification');

const driver = express.Router();

driver.post('/register', async (req, res) => {
  const { contactInfo, verificationType } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const db = getDB();
  const driverCollection = db.collection('drivers');

  try {
    const existing = await driverCollection.findOne({
      [verificationType]: contactInfo,
    });

    if (existing) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

     // Send verification code via email (or SMS in the future)
     if (verificationType === 'email') {
        try {
          await sendVerificationEmail(contactInfo, code);
        } catch (emailErr) {
          return res.status(500).json({ message: 'Error sending verification email', error: emailErr.message });
        }
      } 
      // else if (verificationType === 'phone') {
      //   // Implement SMS verification in the future
      // }
    await driverCollection.insertOne({
      [verificationType]: contactInfo,
      dob: null,
      verificationCode: code,
      verificationType,
      isVerified: false,
      password: null,
      name: null,
      termsAccepted: false,
      vehicle: {
        seats: null,
        vehicleno: null,
        color: null,
        licence: null,
        explicence: null,
        aadharcardno: null,
        rcno: null,
        photo: null
      },
      location: null,
      preferredTime: { start: null, end: null },
      acceptedrides: [],
      createdAt: new Date()
    });

    res.status(200).json({ message: 'Verification code sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering driver', error: err.message });
  }
});

// Step 2: Complete registration with details and verify code
driver.post('/verify', async (req, res) => {
  const { contactInfo, verificationCode, name, password, description, termsAccepted } = req.body;
  const db = getDB();
  const collection = db.collection('drivers');

  try {
    const driverDoc = await collection.findOne({
      $or: [{ email: contactInfo }, { phone: contactInfo }],
      verificationCode,
    });

    if (!driverDoc) {
      return res.status(400).json({ message: 'Invalid code or contact info' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ message: 'You must accept the terms and policies' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.updateOne(
      { _id: driverDoc._id },
      {
        $set: {
          name,
          password: hashedPassword,
          description: description || '',
          isVerified: true,
          termsAccepted: true,
        },
        $unset: { verificationCode: '', verificationType: '' },
      }
    );

    res.status(200).json({ message: 'Driver registration complete' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

// Step 3: Vehicle details
driver.post('/vehicle-details', async (req, res) => {
    const { contactInfo, vehicle } = req.body;
  
    const db = getDB();
    const collection = db.collection('drivers');
  
    try {
      const result = await collection.updateOne(
        {
          $or: [{ email: contactInfo }, { phone: contactInfo }],
          isVerified: true
        },
        {
          $set: {
            vehicle: {
              seats: vehicle.seats,
              vehicleno: vehicle.vehicleno,
              color: vehicle.color,
              licence: vehicle.licence,
              explicence: vehicle.explicence,
              aadharcardno: vehicle.aadharcardno,
              rcno: vehicle.rcno,
              photo: vehicle.photo
            }
          }
        }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Verified driver not found' });
      }
  
      res.status(200).json({ message: 'Vehicle details saved successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to save vehicle details', error: err.message });
    }
  });

  driver.post('/preferences', async (req, res) => {
    const { contactInfo, preferredTime, location } = req.body;
    // console.log("Preferred time: ",preferredTime)
    const db = getDB();
    const collection = db.collection('drivers');
  
    try {
      const result = await collection.updateOne(
        {
          $or: [{ email: contactInfo }, { phone: contactInfo }],
          isVerified: true
        },
        {
          $set: {
            preferredTime,
            location
          }
        }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Verified driver not found' });
      }
  
      res.status(200).json({ message: 'Preferences saved successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to save preferences', error: err.message });
    }
  });
  
  driver.post('/accept-ride', async (req, res) => {
    const { driverId, rideDetails } = req.body;
    const { rideId } = rideDetails;  // Only need the rideId
  
    const db = getDB();
    const driverCollection = db.collection('drivers');
    const rideCollection = db.collection('rides');
  
    try {
      // Step 1: Add to ongoing rides
      const updateDriver = await driverCollection.updateOne(
        { _id: driverId },
        { $push: { ongoingrides: rideId }, $pull: { pendingrides: rideId } }  // Move from pending to ongoing
      );
  
      if (updateDriver.modifiedCount === 0) {
        return res.status(500).json({ message: 'Failed to update driver ongoing rides' });
      }
  
      // Step 2: Set ride as "accepted" and move to ongoing rides in rides collection
      await rideCollection.updateOne(
        { _id: rideId },
        { $set: { status: 'ongoing' } }
      );
  
      res.status(200).json({ message: 'Ride accepted successfully', rideId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  
module.exports = driver;
