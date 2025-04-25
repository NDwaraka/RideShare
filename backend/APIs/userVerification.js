const express = require('express');
const { getDB } = require('../config/db.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const user = express.Router();

// Generate transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send numeric verification code
const sendVerificationEmail = async (email, code) => {
  //console.log('Sending code : ', code);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
};

// 🔸 Resend verification code
user.post('/resend-verification', async (req, res) => {
  const { email, type } = req.body;
  const db = getDB();
  const collectionName = type === 'admin' ? 'admins' : 'users';

  try {
    const user = await db.collection(collectionName).findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await db.collection(collectionName).updateOne(
      { email },
      {
        $set: {
          verificationCode: code,
          codeCreatedAt: new Date(),
        }
      }
    );

    await sendVerificationEmail(email, code);

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Verify email using code
user.post('/verify-code', async (req, res) => {
  const { email, code, type } = req.body;
  const db = getDB();
  const collectionName = type === 'admin' ? 'admins' : 'users';

  try {
    const user = await db.collection(collectionName).findOne({ email, verificationCode: code });

    if (!user) return res.status(400).send('Invalid code');

    // Check if code expired (10 mins = 600000 ms)
    const now = Date.now();
    const codeCreatedAt = new Date(user.codeCreatedAt);
    const timeDifference = now - codeCreatedAt.getTime();

    if (timeDifference > 10 * 60 * 1000) {
      return res.status(400).send('Code has expired. Please request a new one.');
    }

    await db.collection(collectionName).updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationCode: "", codeCreatedAt: "" },
      }
    );

    res.send('Email verified successfully');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = {
  router: user,
  sendVerificationEmail
};
