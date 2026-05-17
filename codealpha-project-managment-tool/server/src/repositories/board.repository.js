const { Board, Task, User } = require('../models');

module.exports = {
  findByProject: (projectId) => Board.findAll({
    where: { projectId },
    order: [['order','ASC']],
    include: [{
      model: Task, as: 'tasks', order: [['order','ASC']],
      include: [{ model: User, as: 'assignees', attributes: ['id','name','email'], through: { attributes: [] } }],
    }],
  }),
  findById: (id) => Board.findByPk(id),
  create: (data) => Board.create(data),
  update: (id, data) => Board.update(data, { where: { id } }),
  destroy: (id) => Board.destroy({ where: { id } }),
};