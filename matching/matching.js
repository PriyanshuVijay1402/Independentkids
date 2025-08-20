const { getDistanceMatrix } = require('../services/googleMapsService');
const { getAvailableDrivers } = require('../services/driverService'); // You can hardcode driver list for now
const { getCachedDependentActivity } = require('../config/redis');

async function matchDependentWithDrivers(userId, dependentName, activityName) {
  try {
    const dependentActivity = await getCachedDependentActivity(userId, dependentName, activityName);
    if (!dependentActivity) throw new Error('Dependent activity not found');

    const drivers = await getAvailableDrivers(); // Implement this function

    const rankedDrivers = [];

    for (const driver of drivers) {
      const distanceInfo = await getDistanceMatrix(dependentActivity.address, driver.address);
      
      // Example filter
      if (driver.trustScore >= 0.8 && distanceInfo.durationValue <= 1800) { // 30 mins
        rankedDrivers.push({
          driverId: driver.id,
          name: driver.name,
          trustScore: driver.trustScore,
          durationText: distanceInfo.durationText,
          distanceText: distanceInfo.distanceText,
        });
      }
    }

    rankedDrivers.sort((a, b) => a.durationValue - b.durationValue);
    return rankedDrivers;

  } catch (error) {
    console.error('Matching Error:', error);
    throw error;
  }
}

module.exports = { matchDependentWithDrivers };
