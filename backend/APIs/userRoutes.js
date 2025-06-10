const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, findUserByEmail } = require('../models/User'); // Assuming your user logic is in models/User.js
const router = express.Router();

// User Registration Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await registerUser({ name, email, password });
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
