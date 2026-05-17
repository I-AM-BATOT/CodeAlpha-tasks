
const commentRepo = require('../repositories/comment.repository');
const taskRepo = require('../repositories/task.repository');
const notifRepo = require('../repositories/notification.repository');
const { getIO } = require('../config/socket');

module.exports = {
  create: async (taskId, text, userId) => {
    const comment = await commentRepo.create({ taskId, text, userId });
    const task = await taskRepo.findById(taskId);

    try {
      getIO().to(`project:${task?.projectId}`).emit('comment:added', { taskId, comment });
    } catch {}

    // Notify the task creator if different from commenter
    if (task && task.createdBy !== userId) {
      const n = await notifRepo.create({
        userId: task.createdBy,
        text: `${comment.userId} commented on "${task.title}": "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`,
        taskId,
      });
      try { getIO().to(`user:${task.createdBy}`).emit('notification', n); } catch {}
    }

    // Also notify the commenter themselves so they can see it works
    const selfNotif = await notifRepo.create({
      userId,
      text: `You commented on "${task?.title}"`,
      taskId,
    });
    try { getIO().to(`user:${userId}`).emit('notification', selfNotif); } catch {}

    return comment;
  },

  getByTask: (taskId) => commentRepo.findByTask(taskId),
};

