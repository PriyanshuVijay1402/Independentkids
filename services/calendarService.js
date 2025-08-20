const { google } = require('googleapis');

async function createCalendarEvent(auth, eventData) {
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventData.summary,
    location: eventData.location,
    description: eventData.description,
    start: {
      dateTime: eventData.start,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: eventData.end,
      timeZone: 'Asia/Kolkata',
    },
    attendees: eventData.attendees || [],
  };

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return res.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

module.exports = { createCalendarEvent };
