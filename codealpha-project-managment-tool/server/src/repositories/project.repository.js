
const { Project, User, Board, ProjectMember } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  findAllForUser: async (userId) => {
    const memberships = await ProjectMember.findAll({ where: { userId } });
    const projectIds = memberships.map(m => m.projectId);
    if (!projectIds.length) return [];
    return Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      include: [
        { model: User, as: 'members', attributes: ['id','name','email'], through: { attributes: ['role'] } },
        { model: Board, as: 'boards', attributes: ['id','title','order'] },
      ],
    });
  },

  findById: (id) => Project.findByPk(id, {
    include: [
      { model: User, as: 'members', attributes: ['id','name','email'], through: { attributes: ['role'] } },
      { model: Board, as: 'boards', order: [['order','ASC']] },
    ],
  }),

  create: (data) => Project.create(data),

  addMember: (projectId, userId, role = 'member') =>
    ProjectMember.create({ projectId, userId, role }),

  // DELETE project and all related data
  destroy: async (id) => {
    await ProjectMember.destroy({ where: { projectId: id } });
    await Project.destroy({ where: { id } });
  },
};
