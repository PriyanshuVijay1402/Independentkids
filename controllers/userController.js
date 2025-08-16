const cloudinary = require('../config/cloudinary');
const User = require('../db/models/user');

// Upload user profile photo
const uploadUserPhoto = async (req, res) => {
  const userId = req.params.id;

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'carpool_users' },
      async (err, result) => {
        if (err) return res.status(500).json({ error: 'Cloudinary upload failed' });

        const user = await User.findByIdAndUpdate(
          userId,
          { profileImage: result.secure_url },
          { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'Image uploaded', imageUrl: result.secure_url });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Upload dependent (child) photo
const uploadDependentPhoto = async (req, res) => {
  try {
    const userId = req.params.id;
    const dependentName = req.params.dependentName;
    const photo = req.file;

    if (!photo) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const dependent = user.dependent_information.find(d => d.name === dependentName);
    if (!dependent) return res.status(404).json({ message: 'Dependent not found' });

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dependent_photos' },
      async (err, result) => {
        if (err) {
          console.error('Cloudinary Error:', err);
          return res.status(500).json({ message: 'Upload failed' });
        }

        dependent.profileImage = result.secure_url;
        await user.save();

        res.json({ message: 'Photo uploaded successfully', profileImage: result.secure_url });
      }
    );

    uploadStream.end(photo.buffer);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { uploadUserPhoto, uploadDependentPhoto };
