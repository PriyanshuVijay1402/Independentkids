require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const Model = require('./vars/claudeEnum');

// Initialize the client
const anthropic = new Anthropic();

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
    const profile = stateManager.userProfile
    console.debug(profile)
    const existingDependent = profile.dependent_information?.find(d => d.name === dependentData.basic.name);
    console.debug(existingDependent)

    // If dependent exists in cache, append new activity
    if (existingDependent) {
      const newActivity = {
        name: dependentData.activity.name,
        address: dependentData.activity.address,
        time_window: dependentData.activity.time_window,
        sharing_preferences: dependentData.preference,
        schedule: dependentData.schedule || []
      };

      // Return existing dependent data with new activity appended and additional_info updated
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
      activities: [{
        name: dependentData.activity.name,
        address: dependentData.activity.address,
        time_window: dependentData.activity.time_window,
        sharing_preferences: dependentData.preference,
        schedule: dependentData.schedule || []
      }],
      additional_info: dependentData.additional_info
    };
  } catch (error) {
    console.error('Error in assembleDependent:', error);
  }
}

module.exports = {
  claude,
  extractJSON,
  extractDeepJSON,
  assembleDependent
};
