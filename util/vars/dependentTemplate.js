// structure for address
const addressTemplate = {
  street: null,
  city: null,
  state: null
}

// structure for sharing preference
const sharingPreferencesTemplate = {
  willing_to_share_rides: null,
  sharing_type: null
}

// structure for time window
const timeWindowTemplate = {
  start: null,
  end: null
};

// structure for ride
const rideTemplate = {
  can_provide: null,
  vehicle_id: null,
  time_window: { ...timeWindowTemplate }
};

// structure for transport availability
const transportAvailabilityTemplate = {
  dropoff: { ...rideTemplate },
  pickup: { ...rideTemplate }
};

// structure for schedule items
const scheduleItemTemplate = {
  day_of_week: null,
  transport_availability: { ...transportAvailabilityTemplate }
};





// Define the structure for activities objects
const activityTemplate = {
  name: null,
  address: { ...addressTemplate },
  time_window: { ...timeWindowTemplate },
  sharing_preferences: { ...sharingPreferencesTemplate },
  schedule: [ { ...scheduleItemTemplate } ] // Array of schedule items
};

// structure of school object
const schoolInfoTemplate = {
  name: null,
  address: { ...addressTemplate },
  time_window: { ...timeWindowTemplate }
}

// Define basic info template
const basicInfoTemplate = {
  name: null,
  gender: null,
  age: null,
  grade: null
};

// Define the main dependent template
const dependentTemplate = Object.assign(
  {},
  basicInfoTemplate,
  {
    school_info: { ...scheduleItemTemplate },
    activities: [ { ...activityTemplate } ] // Array of activity items
  }
);

module.exports = {
  addressTemplate,
  sharingPreferencesTemplate,
  timeWindowTemplate,
  rideTemplate,
  transportAvailabilityTemplate,
  scheduleItemTemplate,
  activityTemplate,
  basicInfoTemplate,
  schoolInfoTemplate,
  dependentTemplate
};
