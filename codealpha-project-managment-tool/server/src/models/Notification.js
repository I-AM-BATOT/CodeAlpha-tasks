const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.STRING(300), allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  taskId: { type: DataTypes.INTEGER, defaultValue: null },
}, { tableName: 'notifications', timestamps: true });