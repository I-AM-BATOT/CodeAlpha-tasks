const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Board = require('./Board');
const Task = require('./Task');
const TaskAssignment = require('./TaskAssignment');
const Comment = require('./Comment');
const Notification = require('./Notification');

Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });

Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', as: 'projects' });

Project.hasMany(Board, { foreignKey: 'projectId', as: 'boards', onDelete: 'CASCADE' });
Board.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Board.hasMany(Task, { foreignKey: 'boardId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

Task.belongsToMany(User, { through: TaskAssignment, foreignKey: 'taskId', as: 'assignees' });
User.belongsToMany(Task, { through: TaskAssignment, foreignKey: 'userId', as: 'assignedTasks' });

Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Project, ProjectMember, Board, Task, TaskAssignment, Comment, Notification };