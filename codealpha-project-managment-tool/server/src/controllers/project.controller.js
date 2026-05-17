
const projectService = require('../services/project.service');
const { success } = require('../utils/response');

module.exports = {
  getAll: async (req, res, next) => {
    try { success(res, await projectService.getAll(req.user.id)); }
    catch (err) { next(err); }
  },
  getOne: async (req, res, next) => {
    try { success(res, await projectService.getOne(req.params.id, req.user.id)); }
    catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try { success(res, await projectService.create(req.body, req.user.id), 'Project created', 201); }
    catch (err) { next(err); }
  },
  invite: async (req, res, next) => {
    try {
      const result = await projectService.inviteByEmail(req.params.id, req.body.email, req.user.id);
      success(res, result, 'User invited successfully');
    }
    catch (err) { next(err); }
  },
  getMembers: async (req, res, next) => {
    try { success(res, await projectService.getMembers(req.params.id)); }
    catch (err) { next(err); }
  },
  removeMember: async (req, res, next) => {
    try {
      await projectService.removeMember(req.params.id, req.params.userId, req.user.id);
      success(res, null, 'Member removed');
    }
    catch (err) { next(err); }
  },
  destroy: async (req, res, next) => {
    try {
      await projectService.destroy(req.params.id, req.user.id);
      success(res, null, 'Project deleted');
    }
    catch (err) { next(err); }
  },
};

