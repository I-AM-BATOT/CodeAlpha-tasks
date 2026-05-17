const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `uploads/${folder}`;
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
  }
};

const uploadAvatar = multer({ storage: storage('avatars'), fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadPost   = multer({ storage: storage('posts'),   fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { uploadAvatar, uploadPost };