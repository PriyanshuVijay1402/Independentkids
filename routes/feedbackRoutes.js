const express = require('express');
const router = express.Router();
const {
  generateFeedback,
  generateProfileSummary
} = require('../controllers/feedbackController');

router.post('/feedback', generateFeedback);
router.post('/profile-summary', generateProfileSummary);

module.exports = router;
