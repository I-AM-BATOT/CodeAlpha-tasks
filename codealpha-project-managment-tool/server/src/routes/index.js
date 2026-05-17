const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/projects', require('./project.routes'));
router.use('/boards', require('./board.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/comments', require('./comment.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;