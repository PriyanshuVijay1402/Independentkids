// routes/rematchRoutes.js
const express = require('express');
const router = express.Router();
const { rematch } = require('../controllers/rematchController');

router.post('/create', rematch);

module.exports = router;
