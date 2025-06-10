const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db'); // MongoDB connection file

// Register User
const registerUser = async (userData) => {
  const db = getDb();
  const usersCollection = db.collection('users');

  const { name, email, password } = userData;

  // Check if user already exists
  const userExists = await usersCollection.findOne({ email });
  if (userExists) throw new Error('User already exists');

  // Hash password before saving to DB
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new user
  const newUser = { name, email, password: hashedPassword };
  await usersCollection.insertOne(newUser);
  return newUser;
};

// Find user by email (for login)
const findUserByEmail = async (email) => {
  const db = getDb();
  const usersCollection = db.collection('users');
  return usersCollection.findOne({ email });
};

module.exports = { registerUser, findUserByEmail };
