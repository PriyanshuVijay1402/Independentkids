const mongoose = require('mongoose');
const { generateProfileSummary } = require('../../services/profileSummaryService');

// Define the address sub-schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: { type: String, default: null },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null }
}, { _id: false });

// Define the time_window sub-schema
const timeWindowSchema = new mongoose.Schema({
  start_time: String,
  end_time: String
}, { _id: false });

// Define the transport_availability sub-schema
const transportAvailabilitySchema = new mongoose.Schema({
  time_window: {
    type: timeWindowSchema,
    required: false,
    default: null
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
  time_window: timeWindowSchema
}, { _id: false });

// Define the sharing_preferences sub-schema
const sharingPreferencesSchema = new mongoose.Schema({
  willing_to_share_rides: Boolean,
  sharing_type: {
    type: String,
    enum: ['rotation', 'split', null],
    default: null
  }
}, { _id: false });

// Define the schedule sub-schema
const scheduleSchema = new mongoose.Schema({
  day_of_week: Number,
  transport_availability: {
    dropoff: { type: transportAvailabilitySchema, default: null },
    pickup: { type: transportAvailabilitySchema, default: null }
  }
}, { _id: false });

// Define the activity sub-schema
const activitySchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  time_window: timeWindowSchema,
  sharing_preferences: sharingPreferencesSchema,
  schedule: [scheduleSchema],
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

// Updated: Define the dependent_information sub-schema with profileImage
const dependentInformationSchema = new mongoose.Schema({
  name: String,
  gender: String,
  age: Number,
  grade: Number,
  school_info: schoolInfoSchema,
  activities: [activitySchema],
  additional_info: mongoose.Schema.Types.Mixed,
  profileImage: { type: String, default: process.env.DEFAULT_PROFILE_IMAGE } //  Added for child image upload
}, { _id: false });

// Define the main user schema
const userSchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  email: String,
  phone: String,
  profileImage: { type: String, default: process.env.DEFAULT_PROFILE_IMAGE }, //  User image
  safety_info: safetyInfoSchema,
  vehicles: [vehicleSchema],
  isRider: Boolean,
  isDriver: Boolean,
  friend_list: [String],
  dependent_information: [dependentInformationSchema],
  carpool_preference: carpoolPreferenceSchema,

  // NEW FIELDS for Week 7
  feedbackHistory: [
    {
      operation_name: String,
      entity_name: String,
      reason: String,
      rating: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  trustScore: {
    type: Number,
    default: 100
  },
  generatedSummary: {
    type: String,
    default: ''
  }
});


//  NEW: Auto-generate profile summary before saving
userSchema.pre('save', function (next) {
  this.generatedSummary = generateProfileSummary(this);
  next();
});

//  NEW: Auto-generate profile summary before updating
userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.$set) {
    const simulatedUser = { ...this._conditions, ...update.$set };
    update.$set.generatedSummary = generateProfileSummary(simulatedUser);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

