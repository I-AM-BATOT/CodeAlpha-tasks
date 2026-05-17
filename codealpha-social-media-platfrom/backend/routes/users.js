

// ===================== routes/users.js =====================
const userRouter = require('express').Router();
const { getProfile, updateProfile, searchUsers } = require('../controllers/userController');
const { protect: prot } = require('../middleware/auth');
const { uploadAvatar } = require('../config/multer');

userRouter.get('/search',          prot, searchUsers);
userRouter.get('/:id',             prot, getProfile);
userRouter.put('/profile',         prot, uploadAvatar.single('profile_pic'), updateProfile);

module.exports = userRouter;