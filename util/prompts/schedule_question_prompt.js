const prompts = {
  scheduleQuestion: (profileContext, preference, input) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);
    return `You are a carpool assistant analyzing schedule and transport availability information.

Current profile context:
${profileContextString}

Sharing preferences: ${preference}

Given the user input "${input}", create a schedule list where each entry represents a day when the activity occurs.

RULES:
1. Day Parsing:
   - Convert day names or abbreviations to numbers (1-7, where 1=Monday)
   - Accept full names (Monday), abbreviations (Mon), or single letters (M)
   - Handle combinations (Monday and Wednesday, Mon & Wed, M/W)
   - Each day should only appear once

2. Transport Availability:
   - If willing_to_share_rides is false: create entries with only day_of_week
   - If sharing_type is "rotation" or null: create entries with only day_of_week
   - If sharing_type is "split": include transport_availability object
   - Pickup/dropoff windows must use "HH:MM" format

3. Schedule Creation:
   - If no valid days found: return empty schedule with hint message
   - If days found: create schedule entries based on sharing preferences
   - Each entry must follow the exact JSON structure shown in examples

Output must be valid JSON with this structure:
{
  "answer": "Brief explanation of what was processed",
  "schedule": [
    {
      "day_of_week": number,
      "transport_availability"?: {
        "pickup_window"?: {
          "start_time": string,
          "end_time": string
        },
        "dropoff_window"?: {
          "start_time": string,
          "end_time": string
        }
      }
    }
  ],
  "hintMsg": "Help message if needed",
  "isComplete": boolean
}

Example outputs:

1. Basic schedule (no sharing or rotation sharing):
{
  "answer": "Schedule set for Monday (1) and Wednesday (3)",
  "schedule": [
    {"day_of_week": 1},
    {"day_of_week": 3}
  ],
  "hintMsg": "",
  "isComplete": true
}

2. Split sharing schedule:
{
  "answer": "Schedule set with transport availability",
  "schedule": [
    {
      "day_of_week": 1,
      "transport_availability": {
        "dropoff_window": {
          "start_time": "15:30",
          "end_time": "15:50"
        }
      }
    },
    {
      "day_of_week": 3,
      "transport_availability": {
        "pickup_window": {
          "start_time": "17:30",
          "end_time": "17:45"
        }
      }
    }
  ],
  "hintMsg": "",
  "isComplete": true
}

3. Invalid input:
{
  "answer": "I need to know which days of the week the activity takes place",
  "schedule": [],
  "hintMsg": "Please specify which day(s) of the week the activity occurs (e.g., Monday and Wednesday, or Mon/Wed)",
  "isComplete": false
}`
  }
};

module.exports = prompts;
