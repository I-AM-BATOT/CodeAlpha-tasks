

// ===================== routes/posts.js =====================
const postRouter = require('express').Router();
const {
  getFeed, getFollowingFeed, getUserPosts,
  createPost, updatePost, deletePost
} = require('../controllers/postController');
const { protect: p } = require('../middleware/auth');
const { uploadPost } = require('../config/multer');

postRouter.get('/',              p, getFeed);
postRouter.get('/following',     p, getFollowingFeed);
postRouter.get('/user/:userId',  p, getUserPosts);
postRouter.post('/',             p, uploadPost.single('image'), createPost);
postRouter.put('/:id',           p, updatePost);
postRouter.delete('/:id',        p, deletePost);

module.exports = postRouter;
