const boardService = require('../services/board.service');
const { success } = require('../utils/response');

module.exports = {
  getByProject: async (req, res, next) => {
    try { success(res, await boardService.getByProject(req.params.projectId)); } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try { success(res, await boardService.create(req.body), 'Created', 201); } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try { success(res, await boardService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },
  destroy: async (req, res, next) => {
    try { await boardService.destroy(req.params.id); success(res, null, 'Deleted'); } catch (err) { next(err); }
  },
};