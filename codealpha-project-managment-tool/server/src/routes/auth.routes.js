
const router  = require('express').Router();
const ctrl    = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const auth    = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register',         validate(registerSchema), ctrl.register);
router.post('/login',            validate(loginSchema),    ctrl.login);
router.post('/refresh',                                    ctrl.refresh);
router.post('/logout',           auth,                     ctrl.logout);
router.get('/me',                auth,                     ctrl.getMe);
router.patch('/profile',         auth,                     ctrl.updateProfile);
router.patch('/change-password', auth,                     ctrl.changePassword);

module.exports = router;

