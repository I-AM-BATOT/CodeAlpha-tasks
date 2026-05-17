
// ===================== routes/likes.js =====================
const likeRouter = require('express').Router();
const { toggleLike } = require('../controllers/likeController');
const { protect: lp } = require('../middleware/auth');

likeRouter.post('/:postId', lp, toggleLike);

module.exports = likeRouter;