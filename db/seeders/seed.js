const mongoose = require('mongoose');
const User = require('../models/user');
const data = require('./dummy_data.json');
const connectDB = require('../../config/db');

// to reimport
// sudo service mongodb restart && npm run seed
const importData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await User.deleteMany({});

    // Transform the data to handle dates and remove string _ids
    const transformedUsers = data.users.map(user => {
      // Deep clone the user object
      const transformedUser = JSON.parse(JSON.stringify(user));

      // Remove the string _id and let MongoDB regenerate it
      delete transformedUser._id;

      // Convert driver's license expiration dates
      if (transformedUser.safety_info && transformedUser.safety_info.drivers) {
        transformedUser.safety_info.drivers.forEach(driver => {
          if (driver.drivingLicense && driver.drivingLicense.expirationDate) {
            driver.drivingLicense.expirationDate = new Date(driver.drivingLicense.expirationDate);
          }
        });
      }

      // Update friend_list references to be handled after insertion
      transformedUser.friend_list = [];

      return transformedUser;
    });

    // Insert the data
    const insertedUsers = await User.insertMany(transformedUsers);
    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
