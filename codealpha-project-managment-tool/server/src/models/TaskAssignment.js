const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('TaskAssignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'task_assignments', timestamps: false });