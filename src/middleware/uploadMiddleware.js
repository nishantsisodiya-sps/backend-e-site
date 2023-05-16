const multer = require('multer');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../../uploads'));
//     console.log('inside middleware');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const thumbnail = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 // 1 MB
//   },
//   fileFilter: function(req, file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG, JPG and PNG files are allowed for thumbnail'));
//     }
//   }
// }).single('thumbnail');

// const images = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 // 1 MB
//   },
//   fileFilter: function(req, file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG, JPG and PNG files are allowed for images'));
//     }
//   }
// }).array('images', 5);

// module.exports = {
//   thumbnail,
//   images
// };

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