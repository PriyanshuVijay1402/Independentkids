const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { calculateTrustScore } = require('../services/visionTrustScore');

const router = express.Router();

// Multer config with file type & size limits
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * POST /api/trust/upload
 * Accepts a driver's photo and license image and returns a trust score
 */
router.post(
  '/upload',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'license', maxCount: 1 }
  ]),
  async (req, res) => {
    let photoPath, licensePath;
    try {
      const { name } = req.body;

      if (!req.files || !req.files['photo'] || !req.files['license']) {
        return res.status(400).json({ error: 'Both photo and license are required' });
      }

      photoPath = req.files['photo'][0].path;
      licensePath = req.files['license'][0].path;

      // Process driver's photo
      const faceScore = await calculateTrustScore(photoPath);

      // Process license image with expected driver's name
      const licenseScore = await calculateTrustScore(licensePath, name);

      // Average trust score
      const finalScore = Math.round((faceScore.score + licenseScore.score) / 2);

      res.json({
        success: true,
        finalScore,
        details: {
          photo: {
            filename: path.basename(photoPath),
            score: faceScore.score,
            analysis: faceScore.analysis,
            processingTimeMs: faceScore.processingTimeMs
          },
          license: {
            filename: path.basename(licensePath),
            score: licenseScore.score,
            analysis: licenseScore.analysis,
            processingTimeMs: licenseScore.processingTimeMs
          }
        }
      });
    } catch (err) {
      console.error('[Trust Score Error]', err);
      res.status(500).json({ error: 'Trust score calculation failed', details: err.message });
    } finally {
      // Always clean up temp files
      [photoPath, licensePath].forEach(file => {
        if (file && fs.existsSync(file)) {
          fs.unlink(file, unlinkErr => {
            if (unlinkErr) console.error(`Error deleting file ${file}:`, unlinkErr);
          });
        }
      });
    }
  }
);

module.exports = router;
