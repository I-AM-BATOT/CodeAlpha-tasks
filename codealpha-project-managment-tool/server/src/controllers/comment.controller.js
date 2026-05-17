const commentService = require('../services/comment.service');
const { success } = require('../utils/response');

module.exports = {
  create: async (req, res, next) => {
    try { success(res, await commentService.create(req.params.taskId, req.body.text, req.user.id), 'Added', 201); } catch (err) { next(err); }
  },
  getByTask: async (req, res, next) => {
    try { success(res, await commentService.getByTask(req.params.taskId)); } catch (err) { next(err); }
  },
};