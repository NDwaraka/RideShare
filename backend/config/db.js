const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// Create a new MongoClient instance
const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to the MongoDB server
    await client.connect();
    db = client.db(process.env.DB_NAME); // Set the database based on the .env DB_NAME
    console.log('MongoDB connected');

    // Create geospatial indexes for the startLocation and endLocation fields
    await createIndexes();
  } catch (err) {
    console.error('MongoDB connection failed', err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

// Function to create geospatial indexes on startLocation and endLocation
const createIndexes = async () => {
  try {
    const ridesCollection = db.collection('rides');

    // Create geospatial indexes on startLocation and endLocation
    await ridesCollection.createIndex({ startLocation: '2dsphere' });
    await ridesCollection.createIndex({ endLocation: '2dsphere' });

    console.log('Geospatial indexes created for startLocation and endLocation');
  } catch (err) {
    console.error('Error creating indexes', err.message);
  }
};

// Function to get the database object
const getDB = () => db;

// Close the MongoDB connection gracefully when the app ends
const closeDB = async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error while closing MongoDB connection', err.message);
  }
};

module.exports = { connectDB, getDB, closeDB };
