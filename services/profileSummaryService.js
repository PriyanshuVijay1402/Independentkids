// services/profileSummaryService.js
const { callClaude } = require('./claudeService');

/**
 * Generate a short 2-3 sentence profile summary using Anthropic Claude.
 * profile is an object from your User model (or a subset).
 */
async function generateProfileSummary(profile) {
  if (!profile) return '';

  // Build a compact text with only the helpful fields
  const name = profile.name || 'N/A';
  const trust = profile.trustScore ?? 'N/A';

  // dependents summary
  const dependents = (profile.dependent_information || []).map(d => {
    const activities = (d.activities || []).map(a => a.name).join(', ');
    return `${d.name} (age ${d.age}) - ${activities || 'no activities'}`;
  }).join('; ');

  const location = profile.address && (profile.address.city || profile.address.state)
    ? `${profile.address.city || ''}${profile.address.city && profile.address.state ? ', ' : ''}${profile.address.state || ''}`.trim()
    : 'Unknown location';

  const prompt = `
Summarize this carpool user profile in 2 short, friendly sentences suitable for a match card (no bullet points). 
Name: ${name}
Location: ${location}
Trust score: ${trust}
Dependents: ${dependents || 'none listed'}
Key bikes / vehicles: ${profile.vehicles && profile.vehicles.length ? profile.vehicles.map(v => v.make + ' ' + v.model).join(', ') : 'none'}
Preferred sharing: ${profile.carpool_preference?.preferred_carpool_group_size || 'not specified'}
Keep it concise and helpful for parents deciding on a carpool match.
`;

  try {
    const text = await callClaude(prompt, { max_tokens: 220 });
    return text;
  } catch (err) {
    console.error('Profile summary generation failed:', err.message || err);
    return '';
  }
}

module.exports = { generateProfileSummary };
