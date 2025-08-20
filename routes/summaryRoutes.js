// routes/summaryRoutes.js
const express = require('express');
const router = express.Router();
const { generateSummary } = require('../controllers/summaryController');

// POST /api/generate-summary
router.post('/generate-summary', generateSummary);

module.exports = router;
