// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../upload'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   }
// });

// // Create multer middleware to handle file uploads
// const upload = multer({
//   storage: storage,
//   limits: {
//     files: 10, // maximum number of files
//     fileSize: 1024 * 1024 * 10 // maximum file size
//   }
// }).fields([
//   { name: 'thumbnail', maxCount: 1 },
//   { name: 'images', maxCount: 10 }
// ]);

// module.exports = upload;



const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const thumbnailUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 // 1 MB
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed for thumbnail'));
    }
  }
}).single('thumbnail');

const imagesUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 // 1 MB
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed for images'));
    }
  }
}).array('images', 5);

module.exports = {
  thumbnailUpload,
  imagesUpload
};
