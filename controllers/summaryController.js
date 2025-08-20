// controllers/summaryController.js
exports.generateSummary = async (req, res) => {
  try {
    const { userId, reviews } = req.body;

    if (!userId || !reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // For now, just join the reviews (later you can use AI/NLP to summarize)
    const summary = reviews.join(' ');

    res.json({
      userId,
      summary,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
