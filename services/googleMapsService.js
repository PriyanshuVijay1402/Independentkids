const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getDistanceMatrix(origin, destination) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origin,
        destinations: destination,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        units: 'metric'
      }
    });

    const element = response.data.rows[0].elements[0];

    return {
      durationText: element.duration.text,
      durationValue: element.duration.value,
      distanceText: element.distance.text,
      distanceValue: element.distance.value
    };
  } catch (error) {
    console.error('Error in getDistanceMatrix:', error.response?.data || error);
    throw error;
  }
}

module.exports = { getDistanceMatrix };
