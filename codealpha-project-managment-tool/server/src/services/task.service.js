
const taskRepo = require('../repositories/task.repository');
const notifRepo = require('../repositories/notification.repository');
const { getIO } = require('../config/socket');

const safeEmit = (event, room, data) => {
  try { getIO().to(room).emit(event, data); } catch (e) { /* socket not ready */ }
};

module.exports = {
  getOne: (id) => taskRepo.findById(id),

  create: async (data, userId) => {
    const task = await taskRepo.create({ ...data, createdBy: userId });
    if (data.assignees?.length) await taskRepo.setAssignees(task.id, data.assignees);
    const full = await taskRepo.findById(task.id);
    safeEmit('task:created', `project:${data.projectId}`, full);

    // Notify each assignee
    for (const uid of (data.assignees || [])) {
      if (uid !== userId) {
        const n = await notifRepo.create({
          userId: uid,
          text: `You were assigned to "${data.title}"`,
          taskId: task.id,
        });
        safeEmit('notification', `user:${uid}`, n);
      }
    }

    // Always notify the creator too (so they can test it easily)
    const selfNotif = await notifRepo.create({
      userId,
      text: `Task "${data.title}" was created successfully`,
      taskId: task.id,
    });
    safeEmit('notification', `user:${userId}`, selfNotif);

    return full;
  },

  update: async (id, data, userId) => {
    const existing = await taskRepo.findById(id);
    if (!existing) throw { status: 404, message: 'Task not found' };
    await taskRepo.update(id, data);
    if (data.assignees !== undefined) await taskRepo.setAssignees(id, data.assignees);
    const updated = await taskRepo.findById(id);
    safeEmit('task:updated', `project:${existing.projectId}`, updated);

    // Notify creator that task was updated
    const n = await notifRepo.create({
      userId: existing.createdBy,
      text: `Task "${existing.title}" was updated`,
      taskId: id,
    });
    safeEmit('notification', `user:${existing.createdBy}`, n);

    return updated;
  },

  move: async (id, boardId, userId) => {
    const task = await taskRepo.findById(id);
    if (!task) throw { status: 404, message: 'Task not found' };
    await taskRepo.update(id, { boardId });
    const updated = await taskRepo.findById(id);
    safeEmit('task:moved', `project:${task.projectId}`, { taskId: id, boardId });

    // Notify about move
    const n = await notifRepo.create({
      userId,
      text: `Task "${task.title}" was moved to a new column`,
      taskId: id,
    });
    safeEmit('notification', `user:${userId}`, n);

    return updated;
  },

  destroy: async (id) => {
    const task = await taskRepo.findById(id);
    if (!task) throw { status: 404, message: 'Task not found' };
    await taskRepo.destroy(id);
    safeEmit('task:deleted', `project:${task.projectId}`, { taskId: id, boardId: task.boardId });
  },
};