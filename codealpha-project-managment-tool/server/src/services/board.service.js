const boardRepo = require('../repositories/board.repository');

module.exports = {
  getByProject: (projectId) => boardRepo.findByProject(projectId),

  create: async (data) => {
    const boards = await boardRepo.findByProject(data.projectId);
    return boardRepo.create({ ...data, order: boards.length });
  },

  update: async (id, data) => { await boardRepo.update(id, data); return boardRepo.findById(id); },
  destroy: (id) => boardRepo.destroy(id),
};