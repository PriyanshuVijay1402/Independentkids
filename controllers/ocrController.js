const Tesseract = require('tesseract.js');
const parseSchedule = require('../util/parseSchedule');
const fs = require('fs');
const path = require('path');
const os = require('os');

const processScheduleOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // Save memory buffer to temp file
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`);
    fs.writeFileSync(tempPath, req.file.buffer);

    const result = await Tesseract.recognize(tempPath, 'eng');
    const rawText = result.data.text;

    const structuredData = parseSchedule(rawText);

    // Delete temp file after OCR
    fs.unlinkSync(tempPath);

    res.status(200).json({ rawText, structuredData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OCR failed', error: err.message });
  }
};

module.exports = { processScheduleOCR };
