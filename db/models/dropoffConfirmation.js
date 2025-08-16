const mongoose = require('mongoose');

const dropoffConfirmationSchema = new mongoose.Schema({
  rideId: String,
  driverId: String,
  dependentId: String,
  photoUrl: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DropoffConfirmation', dropoffConfirmationSchema);
