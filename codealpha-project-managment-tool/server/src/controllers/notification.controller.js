const notifService = require('../services/notification.service');
const { success } = require('../utils/response');

module.exports = {
  getAll: async (req, res, next) => {
    try { success(res, await notifService.getAll(req.user.id)); } catch (err) { next(err); }
  },
  markAllRead: async (req, res, next) => {
    try { await notifService.markAllRead(req.user.id); success(res, null, 'Done'); } catch (err) { next(err); }
  },
  markOneRead: async (req, res, next) => {
    try { await notifService.markOneRead(req.params.id, req.user.id); success(res, null, 'Done'); } catch (err) { next(err); }
  },
};