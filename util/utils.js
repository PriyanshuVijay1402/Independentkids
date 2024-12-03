require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const Model = require('./vars/claudeEnum');
const GeocodingService = require('../services/geocodingService');
const nlp = require('compromise');

// Initialize the clients
const anthropic = new Anthropic();

async function validateAndFormatAddressString(inputString) {
  try {
    // Function to check if text contains a potential address pattern
    function hasAddressPattern(text) {
      // Match basic address pattern (number + street + optional apt/suite)
      return /\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Circle|Cir|Plaza|Plz)\b(\s*(#|Apt|Suite|Unit|Ste|[A-Za-z])?\.?\s*\d*\w*)?/i.test(text);
    }

    // Function to extract complete address pattern
    function extractCompleteAddresses(text) {
      // Match pattern: number + street + optional apt/suite + city + state
      // Example: "123 Main Street #101, San Francisco, CA" or "123 Main Street Apt 101, San Francisco, CA"
      const addressRegex = /\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Circle|Cir|Plaza|Plz)\b(\s*(#|Apt|Suite|Unit|Ste|[A-Za-z])?\.?\s*\d*\w*)?[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\b/gi;
      return Array.from(text.matchAll(addressRegex)).map(match => ({
        text: match[0],
        index: match.index
      }));
    }

    // Check if there's any address-like pattern
    if (hasAddressPattern(inputString)) {
      // Find complete addresses
      const completeAddresses = extractCompleteAddresses(inputString);
      
      // If we found address pattern but no complete addresses (missing city/state), return false
      if (completeAddresses.length === 0) {
        return false;
      }

      // Find all address patterns (including incomplete ones)
      const allAddressPatterns = Array.from(inputString.matchAll(/\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Circle|Cir|Plaza|Plz)\b(\s*(#|Apt|Suite|Unit|Ste|[A-Za-z])?\.?\s*\d*\w*)?/gi));
      
      // If there are more address patterns than complete addresses, some are incomplete
      if (allAddressPatterns.length > completeAddresses.length) {
        return false;
      }

      let currentString = inputString;
      let lastValidResult = null;

      // Validate each complete address
      for (const {text: addressPhrase} of completeAddresses) {
        const geocodeResult = await GeocodingService.geocodeAddress(addressPhrase);
        
        if (!geocodeResult.success) {
          return false;
        }

        // Extract state from original address
        const stateMatch = addressPhrase.match(/,\s*([A-Z]{2})\b/);
        const originalState = stateMatch ? stateMatch[1] : null;
        
        // Extract state from geocoded result
        const geocodedState = geocodeResult.data.formattedAddress.match(/\b([A-Z]{2})\b/);
        const resultState = geocodedState ? geocodedState[1] : null;
        
        // Verify state matches
        if (!originalState || !resultState || originalState !== resultState) {
          return false;
        }

        // Replace the address in the current string
        currentString = currentString.replace(
          addressPhrase,
          `${geocodeResult.data.formattedAddress} (Latitude: ${geocodeResult.data.latitude}, Longitude: ${geocodeResult.data.longitude})`
        );
        lastValidResult = geocodeResult;
      }

      return {
        success: true,
        formattedString: currentString,
        addressData: lastValidResult.data
      };
    }

    // No address pattern found, return original string
    return {
      success: true,
      formattedString: inputString
    };
  } catch (error) {
    console.error('Error in validateAndFormatAddressString:', error);
    return false;
  }
}

async function claude(
  userMessage,
  model = Model.HAIKU,
  maxTokens = 1024
) {
  try {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: userMessage
      }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

function extractJSON(input) {
  // If input is already an object, return it directly
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(JSON.stringify(input));
  }

  // Convert input to string and trim whitespace
  const text = String(input).trim();

  // Try to parse the entire text first
  try {
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find JSON objects in the text
    // This regex looks for objects that may contain nested objects
    const matches = text.match(/\{(?:[^{}]|\{[^{}]*\})*\}/g);
    if (matches) {
      // Return the first valid JSON object found
      for (const match of matches) {
        try {
          return JSON.parse(match);
        } catch (parseError) {
          continue;
        }
      }
    }

    // If no valid JSON found, log a warning and return the original text
    console.warn('No valid JSON found in content:', text);
    return text;
  }
}

function extractDeepJSON(input) {
  // If input is already an object, return it directly
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(JSON.stringify(input));
  }

  // Convert input to string and trim whitespace
  const text = String(input).trim();

  // Try to parse the entire text first
  try {
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find a valid JSON object, including nested structures
    const matches = text.match(/\{[\s\S]*\}/);
    if (matches) {
      for (const match of matches) {
        try {
          return JSON.parse(match);
        } catch (parseError) {
          continue;
        }
      }
    }

    // If no valid JSON found, log a warning and return the original text
    console.warn('No valid JSON found in content:', text);
    return text;
  }
}

function assembleDependent(stateManager) {
  try {
    const dependentData = stateManager.getCurrentDependent();
    if (!dependentData || !dependentData.basic) {
      throw new Error('Invalid dependent data structure');
    }

    const profile = stateManager.userProfile;
    if (!profile) {
      throw new Error('User profile not found');
    }

    const existingDependent = profile.dependent_information?.find(d => d.name === dependentData.basic.name);

    if (!dependentData.activity || !dependentData.activity.name) {
      throw new Error('Invalid activity data structure');
    }

    const newActivity = {
      name: dependentData.activity.name,
      address: dependentData.activity.address,
      time_window: dependentData.activity.time_window,
      sharing_preferences: dependentData.preference,
      schedule: dependentData.schedule || []
    };

    // If dependent exists in cache, append new activity
    if (existingDependent) {
      return {
        ...existingDependent,
        activities: [...existingDependent.activities, newActivity],
        additional_info: dependentData.additional_info
      };
    }

    // If no cached data found or dependent doesn't exist in cache, create new dependent
    return {
      name: dependentData.basic.name,
      gender: dependentData.basic.gender,
      age: dependentData.basic.age,
      grade: dependentData.basic.grade,
      school_info: {
        name: dependentData.school.name,
        address: dependentData.school.address,
        time_window: dependentData.school.time_window
      },
      activities: [newActivity],
      additional_info: dependentData.additional_info || {}
    };
  } catch (error) {
    console.error('Error in assembleDependent:', error);
  }
}

async function findCarpoolMatches(user, dependent_name, activity_name, radius = 1) {
  try {
    // Find the specific dependent and activity
    const dependent = user.dependent_information.find(d => d.name === dependent_name);
    if (!dependent) {
      throw new Error('Dependent not found');
    }

    const activity = dependent.activities.find(a => a.name === activity_name);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Convert radius from miles to approximate latitude/longitude degrees
    // 1 degree of latitude ≈ 69 miles, 1 degree of longitude varies but roughly similar at moderate latitudes
    const degreeRadius = radius / 69;

    // Find potential matches
    const potentialMatches = await User.find({
      _id: { $ne: user._id }, // Exclude the requesting user
      'dependent_information.activities': {
        $elemMatch: {
          name: activity_name,
          'sharing_preferences.willing_to_share_rides': true,
          // Match location within specified radius
          'address.latitude': {
            $gte: activity.address.latitude - degreeRadius,
            $lte: activity.address.latitude + degreeRadius
          },
          'address.longitude': {
            $gte: activity.address.longitude - degreeRadius,
            $lte: activity.address.longitude + degreeRadius
          }
        }
      }
    });

    // Process and format matches
    const matches = potentialMatches.map(match => {
      const matchingDependent = match.dependent_information.find(d => 
        d.activities.some(a => a.name === activity_name)
      );
      
      return {
        user_id: match._id,
        user_name: match.name,
        dependent_name: matchingDependent.name,
        address: match.address,
        activity: matchingDependent.activities.find(a => a.name === activity_name)
      };
    });

    return {
      matches_found: matches.length,
      matches: matches
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  claude,
  extractJSON,
  extractDeepJSON,
  assembleDependent,
  validateAndFormatAddressString,
  findCarpoolMatches
};
