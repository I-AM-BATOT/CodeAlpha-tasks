const notifRepo = require('../repositories/notification.repository');

module.exports = {
  getAll: (userId) => notifRepo.findByUser(userId),
  markAllRead: (userId) => notifRepo.markAllRead(userId),
  markOneRead: (id, userId) => notifRepo.markOneRead(id, userId),
};