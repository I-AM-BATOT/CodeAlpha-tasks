const { Task, User, Comment, TaskAssignment } = require('../models');

module.exports = {
  findById: (id) => Task.findByPk(id, {
    include: [
      { model: User, as: 'assignees', attributes: ['id','name','email'], through: { attributes: [] } },
      { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id','name'] }], order: [['createdAt','ASC']] },
      { model: User, as: 'creator', attributes: ['id','name'] },
    ],
  }),
  create: (data) => Task.create(data),
  update: (id, data) => Task.update(data, { where: { id } }),
  destroy: (id) => Task.destroy({ where: { id } }),
  setAssignees: async (taskId, userIds) => {
    await TaskAssignment.destroy({ where: { taskId } });
    if (userIds?.length) await TaskAssignment.bulkCreate(userIds.map(userId => ({ taskId, userId })));
  },
};