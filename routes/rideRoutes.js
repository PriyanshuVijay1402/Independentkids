const express = require('express');
const upload = require('../middleware/upload');

// Import both controller functions
const { uploadDropoffPhoto, getDropoffConfirmations } = require('../controllers/confirmationController');

const router = express.Router();

// Upload drop-off photo
router.post('/rides/:rideId/dropoff-photo', upload.single('photo'), uploadDropoffPhoto);

// Fetch drop-off confirmations (optionally by rideId)
router.get('/rides/dropoff-confirmations', getDropoffConfirmations);

module.exports = router;
