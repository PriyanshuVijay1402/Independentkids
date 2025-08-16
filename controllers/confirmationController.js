const cloudinary = require('../config/cloudinary');
const DropoffConfirmation = require('../db/models/dropoffConfirmation');

exports.uploadDropoffPhoto = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId, dependentId } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No photo provided' });

    const result = await cloudinary.uploader.upload(req.file.path);

    const confirmation = new DropoffConfirmation({
      rideId,
      driverId,
      dependentId,
      photoUrl: result.secure_url
    });

    await confirmation.save();

    res.json({ message: 'Drop-off photo uploaded', data: confirmation });

  } catch (error) {
    console.error('Drop-off upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get confirmations (optionally by rideId)
exports.getDropoffConfirmations = async (req, res) => {
  try {
    const { rideId } = req.query;

    const query = rideId ? { rideId } : {};
    const confirmations = await DropoffConfirmation.find(query);

    res.json(confirmations);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
