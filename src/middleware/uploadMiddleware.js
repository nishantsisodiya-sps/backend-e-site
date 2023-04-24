const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../upload'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

// Create multer middleware to handle file uploads
const upload = multer({
  storage: storage,
  limits: {
    files: 10, // maximum number of files
    fileSize: 1024 * 1024 * 10 // maximum file size
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

module.exports = upload;