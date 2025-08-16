// routes/ocrRoutes.js
const express = require('express');
const upload = require('../middleware/upload'); // already built
const { processScheduleOCR } = require('../controllers/ocrController');

const router = express.Router();

// Route to upload an image and perform OCR
router.post('/schedule-ocr', upload.single('image'), processScheduleOCR);

module.exports = router;
