const { Comment, User } = require('../models');

module.exports = {
  create: (data) => Comment.create(data),
  findByTask: (taskId) => Comment.findAll({
    where: { taskId },
    include: [{ model: User, as: 'author', attributes: ['id','name'] }],
    order: [['createdAt','ASC']],
  }),
};