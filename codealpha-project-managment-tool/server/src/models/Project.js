const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  color: { type: DataTypes.STRING(20), defaultValue: '#534AB7' },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'projects', timestamps: true });