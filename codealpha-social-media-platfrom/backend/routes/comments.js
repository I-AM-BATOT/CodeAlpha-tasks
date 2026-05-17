
// ===================== routes/comments.js =====================
const commentRouter = require('express').Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect: cp } = require('../middleware/auth');

commentRouter.get('/:postId',    cp, getComments);
commentRouter.post('/:postId',   cp, addComment);
commentRouter.delete('/:id',     cp, deleteComment);

module.exports = commentRouter;