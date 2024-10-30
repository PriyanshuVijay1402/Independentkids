const mongoose = require('mongoose');

// Define the address sub-schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  latitude: Number,
  longitude: Number
}, { _id: false });

// Define the time_window sub-schema
const timeWindowSchema = new mongoose.Schema({
  earliest: String,
  latest: String
}, { _id: false });

// Define the transport_availability sub-schema
const transportAvailabilitySchema = new mongoose.Schema({
  can_provide: { type: Boolean, required: true },
  vechile_id: Number,
  time_window: {
    type: timeWindowSchema,
    required: function () { return this.can_provide; } // Conditional requirement
  }
}, { _id: false });

// Define the driver sub-schema
const driverSchema = new mongoose.Schema({
  relationship: String,
  driving_record: String,
  background_check: String,
  drivingLicense: {
    number: String,
    state: String,
    expirationDate: Date
  }
}, { _id: false });

// Define the vehicle sub-schema
const vehicleSchema = new mongoose.Schema({
  type: String,
  make: String,
  model: String,
  year: Number,
  passengerCapacity: Number,
  carSeats: Number,
  boosterSeats: Number,
  licensePlate: String,
  hasTrunk: Boolean
}, { _id: false });

// Define the school_info sub-schema
const schoolInfoSchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  start_time: String,
  end_time: String
}, { _id: false });

// Define the activity sub-schema
const activitySchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  start_time: String,
  end_time: String
}, { _id: false });

// Define the schedule sub-schema
const scheduleSchema = new mongoose.Schema({
  day_of_week: Number,
  transport_availability: {
    dropoff: transportAvailabilitySchema,
    pickup: transportAvailabilitySchema
  }
}, { _id: false });

// Define the sharing_preferences sub-schema
const sharingPreferencesSchema = new mongoose.Schema({
  willing_to_share_rides: Boolean,
  sharing_type: {
    type: String,
    enum: ['rotation', 'split'],
    default: 'rotation'
  }
}, { _id: false });

// Define the safety_info sub-schema
const safetyInfoSchema = new mongoose.Schema({
  drivers: [driverSchema]
}, { _id: false });

// Define the carpool_preference sub-schema
const carpoolPreferenceSchema = new mongoose.Schema({
  preferred_carpool_group_size: Number,
  gender_preference: {
    type: String,
    enum: ['no_preference', 'same_gender_as_kid', 'different_gender_as_kid'],
    default: 'no_preference'
  },
  language_preferences: [String]
}, { _id: false });

// Define the dependent_information sub-schema
const dependentInformationSchema = new mongoose.Schema({
  name: String,
  gender: String,
  age: Number,
  grade: Number,
  school_info: schoolInfoSchema,
  activities: [activitySchema],
  sharing_preferences: sharingPreferencesSchema,
  schedule: [scheduleSchema],
  additional_info: mongoose.Schema.Types.Mixed // This allows for any type of data
}, { _id: false });

// Define the main user schema
const userSchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  email: String,
  phone: String,
  safety_info: safetyInfoSchema, // Use the safety_info sub-schema here
  vehicles: [vehicleSchema],
  isRider: Boolean,
  isDriver: Boolean,
  friend_list: [String],
  dependent_information: [dependentInformationSchema], // Use the dependent_information sub-schema here
  carpool_preference: carpoolPreferenceSchema // Use the carpool_preference sub-schema here
});

const User = mongoose.model('User', userSchema);

module.exports = User;