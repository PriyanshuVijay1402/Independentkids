const prompts = {
  scheduleQuestion: (scheduleContext, preference, input) => {
    const scheduleContextString = JSON.stringify(scheduleContext, null, 2);
    const preferenceString = JSON.stringify(preference, null, 2);
    return `You are a carpool assistant analyzing schedule and transport availability information.

Current schedule context:
${scheduleContextString}

Sharing preferences: ${preferenceString}

Given the user input "${input}", create a schedule list where each entry represents a day when the activity occurs.

RULES:
1. Day Parsing:
   - Convert day names or abbreviations to numbers (1-7, where 1=Monday, 2=Tuesday, 3=wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday)
   - Accept full names (Monday), abbreviations (Mon), or single letters (M)
   - Handle combinations (Monday and Wednesday, Mon & Wed, M/W)
   - Each day should only appear once

2. Day Validation:
   - When user provides availability, only process days that exist in the current schedule context
   - When user indicates availability is for "all days" or "everyday", apply it ONLY to days already in the schedule context
   - DO NOT add new days to the schedule that aren't already present in the schedule context
   - If user mentions days that don't match the schedule, set isComplete to false and include error in hintMsg

3. Transport Availability:
   - If willing_to_share_rides is false: create entries with only day_of_week
   - If sharing_type is "rotation" or null: create entries with only day_of_week
   - If sharing_type is "split": MUST include transport_availability object for EACH day
   - When user explicitly states they are NOT available on a specific day: set transport_availability to null for that day
   - When user doesn't specify availability for a day: mark isComplete as false and request it
   - Pickup/dropoff windows must use "HH:MM" format
   - When a day has both pickup and dropoff, include both in the same transport_availability object

4. Schedule Creation:
   - If no valid days found: return empty schedule with hint message
   - If days found: create schedule entries based on sharing preferences
   - Each entry must follow the exact JSON structure shown in examples
   - For split sharing: if transport availability is not specified, set isComplete false and request it
   - For split sharing: only set transport_availability to null when user explicitly states unavailability

RESPONSE FORMAT (STRICT JSON, NO ADDITIONAL TEXT):
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

2. Split sharing with explicit unavailability:
{
  "answer": "Schedule set with transport availability. Monday marked as unavailable",
  "schedule": [
    {
      "day_of_week": 1,
      "transport_availability": null
    },
    {
      "day_of_week": 3,
      "transport_availability": {
        "dropoff_window": {
          "start_time": "08:30",
          "end_time": "08:45"
        }
      }
    }
  ],
  "hintMsg": "",
  "isComplete": true
}

3. Split sharing applying to existing schedule days:
{
  "answer": "Applied transport availability to all scheduled days",
  "schedule": [
    {
      "day_of_week": 2,
      "transport_availability": {
        "pickup_window": {
          "start_time": "15:00",
          "end_time": "15:30"
        }
      }
    },
    {
      "day_of_week": 4,
      "transport_availability": {
        "pickup_window": {
          "start_time": "15:00",
          "end_time": "15:30"
        }
      }
    }
  ],
  "hintMsg": "",
  "isComplete": true
}

4. Split sharing schedule with invalid days:
{
  "answer": "Some specified days don't match the activity schedule",
  "schedule": [],
  "hintMsg": "The availability you provided includes days that aren't in the activity schedule. Please provide availability only for scheduled activity days.",
  "isComplete": false
}

5. Split sharing schedule without transport availability:
{
  "answer": "Days identified but need transport availability information",
  "schedule": [
    {
      "day_of_week": 1
    },
    {
      "day_of_week": 3
    }
  ],
  "hintMsg": "Please specify your pickup/dropoff availability windows for each day (in HH:MM format)",
  "isComplete": false
}

6. Invalid input:
{
  "answer": "I need to know which days of the week the activity takes place",
  "schedule": [],
  "hintMsg": "Please specify which day(s) of the week the activity occurs (e.g., Monday and Wednesday, or Mon/Wed)",
  "isComplete": false
}`
  }
};

module.exports = prompts;
