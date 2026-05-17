
const projectRepo = require('../repositories/project.repository');
const userRepo = require('../repositories/user.repository');
const { ProjectMember } = require('../models');

module.exports = {
  getAll: (userId) => projectRepo.findAllForUser(userId),

  getOne: async (id, userId) => {
    const project = await projectRepo.findById(id);
    if (!project) throw { status: 404, message: 'Project not found' };
    return project;
  },

  create: async (data, userId) => {
    const project = await projectRepo.create({ ...data, ownerId: userId });
    await projectRepo.addMember(project.id, userId, 'admin');
    return project;
  },

  // Invite by email
  inviteByEmail: async (projectId, email, inviterId) => {
    if (!email) throw { status: 400, message: 'Email is required' };
    const user = await userRepo.findByEmail(email);
    if (!user) throw { status: 404, message: 'No user found with that email address' };
    const existing = await ProjectMember.findOne({ where: { projectId, userId: user.id } });
    if (existing) throw { status: 409, message: 'User is already a member of this project' };
    await projectRepo.addMember(projectId, user.id, 'member');
    return { userId: user.id, name: user.name, email: user.email };
  },

  getMembers: async (projectId) => {
    const project = await projectRepo.findById(projectId);
    if (!project) throw { status: 404, message: 'Project not found' };
    return project.members || [];
  },

  removeMember: async (projectId, userId, requesterId) => {
    const project = await projectRepo.findById(projectId);
    if (!project) throw { status: 404, message: 'Project not found' };
    if (String(project.ownerId) !== String(requesterId))
      throw { status: 403, message: 'Only the project owner can remove members' };
    if (String(userId) === String(requesterId))
      throw { status: 400, message: 'Owner cannot remove themselves' };
    await ProjectMember.destroy({ where: { projectId, userId } });
  },

  invite: (projectId, userId) => projectRepo.addMember(projectId, userId, 'member'),

  destroy: async (id, userId) => {
    const project = await projectRepo.findById(id);
    if (!project) throw { status: 404, message: 'Project not found' };
    if (String(project.ownerId) !== String(userId))
      throw { status: 403, message: 'Only the project owner can delete this project' };
    await projectRepo.destroy(id);
  },
};

