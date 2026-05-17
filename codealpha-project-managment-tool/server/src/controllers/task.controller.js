const taskService = require('../services/task.service');
const { success } = require('../utils/response');

module.exports = {
  getOne: async (req, res, next) => {
    try { success(res, await taskService.getOne(req.params.id)); } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try { success(res, await taskService.create(req.body, req.user.id), 'Created', 201); } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try { success(res, await taskService.update(req.params.id, req.body, req.user.id)); } catch (err) { next(err); }
  },
  move: async (req, res, next) => {
    try { success(res, await taskService.move(req.params.id, req.body.boardId, req.user.id)); } catch (err) { next(err); }
  },
  destroy: async (req, res, next) => {
    try { await taskService.destroy(req.params.id); success(res, null, 'Deleted'); } catch (err) { next(err); }
  },
};