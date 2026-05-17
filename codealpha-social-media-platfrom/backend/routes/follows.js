const router = require('express').Router();
const { toggleFollow, followStatus } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

router.get('/:userId/status', protect, followStatus);
router.post('/:userId',       protect, toggleFollow);

module.exports = router;