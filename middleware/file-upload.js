const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico'
};

const fileUpload = multer({
  limits: { fileSize: 1000000 }, // 1MB
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = FILE_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + '.' + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!FILE_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid file type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
