// services/visionTrustScore.js
const { faceapi, canvas } = require('./localVisionClient');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');

async function calculateTrustScore(imagePath, expectedName = null) {
  const startTime = Date.now();
  let score = 100;

  const result = {
    score,
    analysis: {
      faceDetected: false,
      blurry: null,
      detectedText: '',
      nameMatch: null
    },
    error: null,
    processingTimeMs: 0
  };

  try {
    // Ensure file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // --- FACE DETECTION ---
    const img = await canvas.loadImage(imagePath);
    const detections = await faceapi.detectAllFaces(img);
    if (detections.length === 0) {
      score -= 40;
      result.analysis.faceDetected = false;
    } else {
      result.analysis.faceDetected = true;
    }

    // --- BLUR CHECK using Sharp (variance of Laplacian replacement) ---
    const { data, info } = await sharp(imagePath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Simple blur detection: variance of pixel values
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;

    if (variance < 500) { // tweak threshold as needed
      score -= 20;
      result.analysis.blurry = 'LIKELY';
    } else {
      result.analysis.blurry = 'UNLIKELY';
    }

    // --- OCR with Tesseract ---
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: () => {} // Suppress logs
    });
    result.analysis.detectedText = text.trim();

    if (expectedName) {
      const isMatch = text.toLowerCase().includes(expectedName.toLowerCase());
      result.analysis.nameMatch = isMatch;
      if (!isMatch) score -= 20;
    }

  } catch (err) {
    console.error('[Trust Score Error]', err);
    result.error = err.message;
    score = 0;
  }

  result.score = Math.max(0, Math.min(100, score));
  result.processingTimeMs = Date.now() - startTime;

  console.log(`[Trust Score] Processed ${imagePath} in ${result.processingTimeMs}ms -> Score: ${result.score}`);
  return result;
}

module.exports = { calculateTrustScore };
