// controllers/rematchController.js
const User = require('../db/models/user'); 
const { generateProfileSummary } = require('../services/profileSummaryService');
// const Feedback = require('../models/feedbackModel'); // Uncomment if you create a feedback model

// Utility: Haversine distance in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(v => typeof v === 'number')) return Infinity;
  const R = 6371;
  const toRad = v => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * POST /api/rematch
 * body: { userId, previousMatchId, feedback }
 */
async function rematch(req, res) {
  try {
    const { userId, previousMatchId, feedback } = req.body;
    if (!userId || !previousMatchId) {
      return res.status(400).json({ error: 'userId and previousMatchId required' });
    }

    // Save feedback if provided (optional, uncomment if Feedback model exists)
    /*
    if (feedback) {
      await Feedback.create({
        userId,
        previousMatchId,
        feedbackText: feedback.text,
        rating: feedback.rating
      });
    }
    */

    // Load user (requesting parent)
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userLat = user.address?.latitude;
    const userLng = user.address?.longitude;

    // Fetch candidates excluding self and previous match
    const candidates = await User.find({
      _id: { $nin: [userId, previousMatchId] }
    }).lean();

    if (!candidates.length) {
      return res.json({ suggestions: [], message: 'No other candidates available' });
    }

    // Score candidates
    const scored = candidates.map(c => {
      const lat = c.address?.latitude;
      const lng = c.address?.longitude;
      const distanceKm = (userLat && userLng && lat && lng) ? haversineKm(userLat, userLng, lat, lng) : 9999;

      const userActs = (user.dependent_information || []).flatMap(d => (d.activities || []).map(a => (a.name || '').toLowerCase()));
      const candActs = (c.dependent_information || []).flatMap(d => (d.activities || []).map(a => (a.name || '').toLowerCase()));
      const actOverlap = userActs.filter(a => a && candActs.includes(a)).length;

      const userSchools = (user.dependent_information || []).map(d => d.school_info?.name?.toLowerCase()).filter(Boolean);
      const candSchools = (c.dependent_information || []).map(d => d.school_info?.name?.toLowerCase()).filter(Boolean);
      const schoolOverlap = userSchools.filter(s => s && candSchools.includes(s)).length;

      const trust = c.trustScore ?? 100;

      const distanceScore = distanceKm === Infinity ? 0 : 1 / (1 + distanceKm);
      const score = (distanceScore * 0.4) + ((actOverlap + schoolOverlap) * 0.25) + (Math.min(trust, 100) / 100 * 0.35);

      return { candidate: c, score, distanceKm, actOverlap, schoolOverlap, trust };
    });

    // Sort & take top 3
    scored.sort((a,b) => b.score - a.score);
    const top = scored.slice(0, 3);

    // Generate summaries
    const suggestions = await Promise.all(top.map(async item => {
      const summary = await generateProfileSummary(item.candidate).catch(() => '');
      return {
        id: item.candidate._id,
        name: item.candidate.name,
        trustScore: item.trust,
        distanceKm: Number(item.distanceKm.toFixed(2)),
        activityOverlap: item.actOverlap,
        schoolOverlap: item.schoolOverlap,
        score: Number(item.score.toFixed(4)),
        summary
      };
    }));

    return res.json({ suggestions, note: 'Top suggestions returned' });
  } catch (err) {
    console.error('Rematch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { rematch };
