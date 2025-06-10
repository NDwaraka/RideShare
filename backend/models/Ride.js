const { Schema, model } = require('mongoose');

const rideSchema = new Schema({
  pickupPoints: {
    type: [String],  // Array of pickup points
    required: true,
  },
  dropPoints: {
    type: [String],  // Array of drop points
    required: true,
  },
  passengers: {
    type: Number,  // Number of passengers
    required: true,
    min: 1,  // Ensure at least one passenger
  },
  vehicleType: {
    type: String,  // Car, bus, auto, etc.
    required: true,
  }
});

const Ride = model('Ride', rideSchema);

module.exports = Ride;
