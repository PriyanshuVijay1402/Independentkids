// services/profileSummaryService.js
const { callClaude } = require('./claudeService');

/**
 * Generate a short 2–3 sentence profile summary using Anthropic Claude.
 * Accepts a full User document (or lean object) from Mongo.
 */
async function generateProfileSummary(profile) {
  if (!profile) return '';

  const name = profile.name || 'N/A';
  const trust = profile.trustScore ?? 'N/A';
  const isDriver = !!profile.isDriver;
  const isRider = !!profile.isRider;

  // Dependents summary
  const dependents = (profile.dependent_information || []).map(d => {
    const acts = (d.activities || []).map(a => a.name).filter(Boolean);
    const actsStr = acts.length ? acts.join(', ') : 'no activities listed';
    return `${d.name || 'Child'} (age ${d.age ?? '?'}) — ${actsStr}`;
  }).join('; ');

  // Vehicles
  const vehicles = Array.isArray(profile.vehicles) ? profile.vehicles : [];
  const vehiclesStr = vehicles.length
    ? vehicles.map(v => [v.make, v.model, v.year].filter(Boolean).join(' ')).join(', ')
    : 'none';

  const city = profile.address?.city || '';
  const state = profile.address?.state || '';
  const location = (city || state) ? `${city}${city && state ? ', ' : ''}${state}` : 'Unknown';

  // Driver bits
  const license = profile.safety_info?.drivers?.[0]?.drivingLicense;
  const licenseState = license?.state ? ` (${license.state})` : '';
  const hasCleanRecord = (profile.safety_info?.drivers?.[0]?.driving_record || '').toLowerCase() === 'clean';

  const prompt = `
You are generating a friendly, concise 2–3 sentence summary for a carpool profile card.
Keep tone positive, practical, and helpful for parents deciding a match. No bullet points.

Profile:
- Name: ${name}
- Location: ${location}
- Trust score: ${trust}
- Role: ${isDriver ? 'Driver' : isRider ? 'Rider' : 'Parent'}
- Vehicles: ${vehiclesStr}
- Driver license state: ${licenseState || 'n/a'}
- Driving record: ${hasCleanRecord ? 'clean' : (profile.safety_info?.drivers?.[0]?.driving_record || 'n/a')}
- Dependents: ${dependents || 'none'}

Please write 2 short sentences max.
If driver has vehicles or clean record, mention it briefly.
If there are dependents with activities, mention that variety briefly.
Avoid marketing fluff—be specific and useful.
`;

  try {
    const text = await callClaude(prompt, { max_tokens: 220 });
    return text || '';
  } catch (err) {
    console.error('Profile summary generation failed:', err.response?.data || err.message || err);
    // fallback summary if LLM fails
    return `${name} in ${location}. Trust score ${trust}. ${isDriver ? 'Drives' : 'Uses carpools'}; vehicles: ${vehiclesStr}.`;
  }
}

module.exports = { generateProfileSummary };
