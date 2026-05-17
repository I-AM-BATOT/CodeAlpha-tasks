const router = require('express').Router();
const ctrl = require('../controllers/comment.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createCommentSchema } = require('../validators/comment.validator');

router.use(auth);
router.get('/task/:taskId', ctrl.getByTask);
router.post('/task/:taskId', validate(createCommentSchema), ctrl.create);

module.exports = router;