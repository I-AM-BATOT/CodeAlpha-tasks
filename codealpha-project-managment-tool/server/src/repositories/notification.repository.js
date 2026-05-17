const { Notification } = require('../models');

module.exports = {
  findByUser: (userId) => Notification.findAll({ where: { userId }, order: [['createdAt','DESC']], limit: 50 }),
  create: (data) => Notification.create(data),
  markAllRead: (userId) => Notification.update({ read: true }, { where: { userId } }),
  markOneRead: (id, userId) => Notification.update({ read: true }, { where: { id, userId } }),
};