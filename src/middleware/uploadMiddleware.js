const multer = require('multer');

// Multer middleware


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    files: 10, // maximum number of files
    fileSize: 1024 * 1024 * 10 // maximum file size (in bytes)
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

module.exports = {upload}