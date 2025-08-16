// utils/parseSchedule.js

// VERY basic parser - can be improved with regex
module.exports = function parseSchedule(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const schedule = [];

  lines.forEach(line => {
    const match = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\s:-]+(.+?)\s+(\d{1,2}[:.]\d{2}\s?(AM|PM))\s*-\s*(\d{1,2}[:.]\d{2}\s?(AM|PM))/i);

    if (match) {
      schedule.push({
        day: match[1],
        activity: match[2].trim(),
        start_time: match[3],
        end_time: match[5]
      });
    }
  });

  return schedule;
};
