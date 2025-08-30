const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Custom multer configuration for user file uploads
const userFileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.params.userId;
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'users', userId);
      // Ensure directory exists
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for user files
    fieldSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

module.exports = userFileUpload;
