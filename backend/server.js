const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection setup
const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

// Database connection middleware
const databaseMiddleware = async (req, res, next) => {
  try {
    if (!db) {
      throw new Error('Database connection not established');
    }
    req.db = db;
    next();
  } catch (err) {
    console.error('Database middleware error:', err);
    res.status(500).json({ message: 'Database connection error', error: err.message });
  }
};

// Function to connect to MongoDB and get the database instance
const connectDB = async () => {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'rideshare');
    console.log("MongoDB connected successfully");

    // Create geospatial indexes for the startLocation and endLocation
    await createIndexes();
    
    // Start the server after successful connection
    startServer();
  } catch (err) {
    console.error("MongoDB connection failed", err.message);
    process.exit(1);
  }
};

// Function to create geospatial indexes
const createIndexes = async () => {
  try {
    const ridesCollection = db.collection('rides');
    await ridesCollection.createIndex({ startLocation: '2dsphere' });
    await ridesCollection.createIndex({ endLocation: '2dsphere' });
    console.log('Geospatial indexes created');
  } catch (err) {
    console.error('Error creating indexes', err.message);
  }
};

// Function to start the server
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Registration Route for new users
app.post('/api/users/register', databaseMiddleware, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const usersCollection = req.db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = { name, email, password: hashedPassword, role: 'user' };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route for users
app.post('/api/users/login', databaseMiddleware, async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = req.db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token with role
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'user' },
      process.env.SECRET_KEY || 'fallbacksecretkey',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply database middleware and use driver routes
app.use('/api/drivers', databaseMiddleware, require('./APIs/driverRoutes'));

// Mount rides routes with database middleware
app.use('/api/rides', databaseMiddleware, require('./APIs/rides'));

// Route to fetch all rides
app.get('/api/rides', databaseMiddleware, async (req, res) => {
  try {
    const rides = await req.db.collection('rides').find({}).toArray();
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rides', error });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to database and start server
connectDB();

// Export the app for testing purposes
module.exports = app;