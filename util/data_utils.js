const User = require('../db/models/user');

async function findCarpoolMatches(user, dependent_name, activity_name, radius = 1) {
  try {
    // Find the specific dependent and activity
    const dependent = user.dependent_information.find(d => d.name === dependent_name);
    if (!dependent) {
      throw new Error('Dependent not found');
    }

    const activity = dependent.activities.find(a => a.name.toLowerCase() === activity_name.toLowerCase());
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Convert time strings to standardized 24-hour format
    const activityStartTime = convertToStandardTime(activity.time_window.start_time);
    const activityEndTime = convertToStandardTime(activity.time_window.end_time);

    console.log('Searching for matches with:', {
      activity_name,
      start_time: activityStartTime,
      end_time: activityEndTime,
      location: `${activity.address.street}, ${activity.address.city}`,
      schedule_days: activity.schedule.map(s => s.day_of_week)
    });

    // Find potential matches
    const potentialMatches = await User.find({
      _id: { $ne: user._id }, // Exclude the requesting user
      'dependent_information.activities': {
        $elemMatch: {
          'sharing_preferences.willing_to_share_rides': true
        }
      }
    });

    console.log(`Found ${potentialMatches.length} potential matches`);

    // Process and filter matches
    const matches = potentialMatches.reduce((acc, match) => {
      console.log(`\nChecking match with user: ${match.name}`);

      const matchingDependent = match.dependent_information.find(d =>
        d.activities.some(a => {
          // Calculate distance between activity locations
          const activityDistance = calculateDistance(
            activity.address.latitude,
            activity.address.longitude,
            a.address.latitude,
            a.address.longitude,
            'miles'
          );

          console.log(`Comparing activity: ${a.name}`);
          console.log(`Location: ${a.address.street}`);
          console.log(`Activity distance: ${activityDistance} miles`);

          // Check if locations are within 0.5 miles
          const isNearbyLocation = activityDistance <= 0.5;
          if (!isNearbyLocation) {
            console.log('Locations too far apart');
            return false;
          }

          // Convert other activity's time to standardized format
          const otherStartTime = convertToStandardTime(a.time_window.start_time);
          const otherEndTime = convertToStandardTime(a.time_window.end_time);

          console.log(`Time windows: ${otherStartTime}-${otherEndTime} vs ${activityStartTime}-${activityEndTime}`);
          console.log(`Schedule days - Activity: ${activity.schedule.map(s => s.day_of_week).join(',')} vs Other: ${a.schedule.map(s => s.day_of_week).join(',')}`);

          // Check if schedules have matching days
          const matchingDays = activity.schedule.filter(s1 =>
            a.schedule.some(s2 => s1.day_of_week === s2.day_of_week)
          );
          const hasMatchingDays = matchingDays.length > 0;

          console.log(`Matching days: ${hasMatchingDays ? matchingDays.map(d => d.day_of_week).join(',') : 'none'}`);

          const timeOverlaps = hasTimeOverlap(
            { start_time: activityStartTime, end_time: activityEndTime },
            { start_time: otherStartTime, end_time: otherEndTime }
          );

          console.log(`Time overlaps: ${timeOverlaps}`);

          return isNearbyLocation && hasMatchingDays && timeOverlaps;
        })
      );

      if (!matchingDependent) {
        console.log('No matching dependent found');
        return acc;
      }

      const matchingActivity = matchingDependent.activities.find(a => {
        const activityDistance = calculateDistance(
          activity.address.latitude,
          activity.address.longitude,
          a.address.latitude,
          a.address.longitude,
          'miles'
        );
        return activityDistance <= 0.5 &&
          activity.schedule.some(s1 => a.schedule.some(s2 => s1.day_of_week === s2.day_of_week));
      });

      // Calculate distance between users' home addresses
      const distance = calculateDistance(
        user.address.latitude,
        user.address.longitude,
        match.address.latitude,
        match.address.longitude,
        'miles'
      );

      console.log(`Distance between homes: ${distance} miles`);

      // Only include matches within the specified radius
      if (distance <= radius) {
        acc.push({
          user_id: match._id,
          user_name: match.name,
          dependent_name: matchingDependent.name,
          home_address: match.address,
          activity: {
            name: matchingActivity.name,
            location: matchingActivity.address,
            time_window: matchingActivity.time_window,
            schedule: matchingActivity.schedule
          },
          distance: distance, // Distance between homes in miles
          activity_distance: calculateDistance( // Distance between activity locations
            activity.address.latitude,
            activity.address.longitude,
            matchingActivity.address.latitude,
            matchingActivity.address.longitude,
            'miles'
          ),
          matching_days: activity.schedule
            .filter(s1 => matchingActivity.schedule.some(s2 => s1.day_of_week === s2.day_of_week))
            .map(s => s.day_of_week)
        });
        console.log('Match added to results');
      }

      return acc;
    }, []);

    return {
      matches_found: matches.length,
      matches: matches
    };
  } catch (error) {
    throw error;
  }
}

// Helper function to convert time strings to standardized 24-hour format
function convertToStandardTime(timeStr) {
  // If already in 24-hour format (e.g., "17:30"), return as is
  if (timeStr.includes(':') && !timeStr.includes('M')) {
    return timeStr;
  }

  // Convert 12-hour format to 24-hour format
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Helper function to check if two time windows overlap within 10 minutes
function hasTimeOverlap(schedule1, schedule2) {
  // Convert time strings to Date objects for comparison
  const date = '1970-01-01T';
  const start1 = new Date(date + schedule1.start_time);
  const end1 = new Date(date + schedule1.end_time);
  const start2 = new Date(date + schedule2.start_time);
  const end2 = new Date(date + schedule2.end_time);

  // Add 10-minute buffer
  start1.setMinutes(start1.getMinutes() - 10);
  end1.setMinutes(end1.getMinutes() + 10);
  start2.setMinutes(start2.getMinutes() - 10);
  end2.setMinutes(end2.getMinutes() + 10);

  return (
    (start1 >= start2 && start1 <= end2) ||
    (end1 >= start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'miles') {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = lat1 * Math.PI / 180;
  const lon1Rad = lon1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const lon2Rad = lon2 * Math.PI / 180;

  // Differences in coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance in kilometers
  let distance = R * c;

  // Convert to miles if requested
  if (unit.toLowerCase() === 'miles') {
    distance = distance * 0.621371;
  }

  // Round to 2 decimal places for practical use
  return Math.round(distance * 100) / 100;
}

module.exports = {
  findCarpoolMatches
};
