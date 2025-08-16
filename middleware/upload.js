const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Use memory for Cloudinary
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb('Images only (jpg, jpeg, png)!');
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
