const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  priority: { type: DataTypes.ENUM('critical','high','medium','low'), defaultValue: 'medium' },
  dueDate: { type: DataTypes.DATEONLY, defaultValue: null },
  labels: {
    type: DataTypes.TEXT, defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('labels') || '[]'); } catch { return []; } },
    set(v) { this.setDataValue('labels', JSON.stringify(v || [])); },
  },
  boardId: { type: DataTypes.INTEGER, allowNull: false },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'tasks', timestamps: true });