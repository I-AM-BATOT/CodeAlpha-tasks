const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Board', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'boards', timestamps: true });