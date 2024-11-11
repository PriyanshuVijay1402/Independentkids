// Prompts for AI interactions in the carpool system

const prompts = {
  activityQuestion: (profileContext, input) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);
    return `You are a carpool assistant collecting activity information. Analyze this profile:
${profileContextString}

PROFILE REQUIREMENTS:
- Required fields for activity:
  * name: string (activity name)
  * address: object containing street, city, state, country
  * start_time: string (in format "H:MM AM/PM")
  * end_time: string (in format "H:MM AM/PM")
  * sharing_preferences: object containing:
    - willing_to_share_rides: boolean
    - sharing_type: string ("split" | "rotation" | null)

TASK:
1. Extract existing activity information from profileContext
   - Use all existing values as base data
   - If a field doesn't exist in profileContext, set it to null

2. Extract activity information from user input: ${input}
   - Extract activity name if provided
   - Extract address components if provided (street, city, state, country)
   - Extract time information if provided (start and end times)
   - Convert any provided time formats to consistent HH:MM format (24-hour)
   - Extract sharing preferences if mentioned

3. Update the activity data:
   - Keep existing values from profileContext for any fields not mentioned in input
   - Only update fields that are explicitly provided in the input
   - Do not overwrite existing data with null values unless explicitly cleared in input

4. Return ONLY a JSON response with no additional text

VALIDATION RULES:
- Activity name: Must be non-empty string
- Address validation:
  * street: REQUIRED - Must be non-empty string
  * city: REQUIRED - Must be non-empty string
  * state: REQUIRED - Must be non-empty string
  * country: Optional - can be null
  * Activity CANNOT be marked as isComplete if street, city, or state is null
- Time validation:
  * Must be in format "HH:MM"
  * end_time must be after start_time
- Sharing preferences validation:
  * willing_to_share_rides defaults to false if not provided
  * sharing_type must be "split" or "rotation" if willing_to_share_rides is true
  * sharing_type must be null if willing_to_share_rides is false

RESPONSE FORMAT (STRICT JSON, NO ADDITIONAL TEXT):
{
  "answer": string,  // Main response message
  "activity": {
    "name": string | null,
    "address": {
      "street": string | null,
      "city": string | null,
      "state": string | null,
      "country": string | null
    },
    "time_window": {
      "start_time": string | null,
      "end_time": string | null,
    },
    "sharing_preferences": {
      "willing_to_share_rides": boolean,
      "sharing_type": string | null
    }
  },
  "hint": string | null,  // Hint about missing or invalid information
  "isComplete": boolean  // true only if all required fields are valid, including complete address
}

EXAMPLES:
1. Complete valid activity:
{
  "answer": "Activity information recorded for Soccer practice",
  "activity": {
    "name": "Soccer",
    "address": {
      "street": "789 Elm St",
      "city": "Anytown",
      "state": "OK",
      "country": null
    },
    "time_window": {
      "start_time": "14:00",
      "end_time": "15:30",
    },
    "sharing_preferences": {
      "willing_to_share_rides": true,
      "sharing_type": "split"
    }
  },
  "hint": null,
  "isComplete": true
}

2. Incomplete activity:
{
  "answer": "Please provide the complete address for Ballet class",
  "activity": {
    "name": "Ballet",
    "address": {
      "street": null,
      "city": "Anytown",
      "state": "TX",
      "country": null
    },
    "time_window": {
      "start_time": "13:00",
      "end_time": null,
    },
    "sharing_preferences": {
      "willing_to_share_rides": false,
      "sharing_type": null
    }
  },
  "hint": "A complete address (street, city, state) and time window are required",
  "isComplete": false
}`
  }
};

module.exports = prompts;
