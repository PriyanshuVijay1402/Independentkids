const prompts = {
  schoolQuestion: (profileContext, input) => {
    const profileContextString = JSON.stringify(profileContext, null, 2);
    return `You are a carpool assistant collecting school information for dependents. Analyze this profile:
${profileContextString}

TASK:
1. Generate appropriate response based on profile and ${input}
   - Provide confirmation message in "answer" field
   - Add helpful hint in "hint" field if information is missing
2. Extract ALL school-related information from user input: ${input}
   - Extract school name
   - Extract address components (street, city, state, country)
   - Extract time window information (start_time, end_time)
   - Convert time formats to consistent HH:MM format (24-hour)
   - IMPORTANT: ALL school information MUST be nested under a "school" object



RESPONSE REQUIREMENTS:
- Response must EXACTLY match the specified format
- "answer" field MUST be included with a clear confirmation message
- "hint" field MUST be included (null if no missing information)
- ALL school information MUST be nested under "school" object
- All other fields must be present, even if null

VALIDATION RULES:
- School name should be a valid institution name
- Address components should be valid location information
- Time format should be in 24-hour format (HH:MM)

HINT GENERATION RULES:
- If address incomplete: "Complete address helps optimize carpool routes"
- If time window missing: "School hours help coordinate pickup/dropoff times"
- If multiple missing: "Complete school details help optimize carpool arrangements"
- Set hint to null if all information is provided

RESPONSE FORMAT (STRICT JSON, NO ADDITIONAL TEXT):
{
  "answer": "string",  // Main response message
  "school": {
    "name": "string | null",
    "address": {
        "street": "string | null",
        "city": "string | null",
        "state": "string | null",
        "country": "string | null",
        "latitude": "number | null",
        "longitude": "number | null"
     },
    "time_window": {
        "start_time": "string | null",
        "end_time": "string | null"
     }
  },
  "hint": "string | null"  // Concise hint about missing info and its benefits
}

EXAMPLES:
1. Complete information:
{
  "answer": "I've recorded all school information for Lincoln Elementary",
  "school": {
    "name": "Lincoln Elementary",
    "address": {
      "street": "123 Education Ave",
      "city": "Springfield",
      "state": "IL",
      "country": "U.S.A",
      "latitude": 39.7817,
      "longitude": -89.6501
    },
    "time_window": {
      "start_time": "08:00",
      "end_time": "15:00"
    }
  },
  "hint": null
}

2. Partial information with unspecified country:
{
  "answer": "I've recorded the school name and location",
  "school": {
    "name": "Washington Middle School",
    "address": {
      "street": "456 Learning Blvd",
      "city": "Portland",
      "state": "OR",
      "country": "U.S.A",
      "latitude": 45.5155,
      "longitude": -122.6789
    },
    "time_window": {
      "start_time": null,
      "end_time": null
    }
  },
  "hint": "School hours help coordinate pickup/dropoff times"
}`
  }
};

module.exports = prompts;
