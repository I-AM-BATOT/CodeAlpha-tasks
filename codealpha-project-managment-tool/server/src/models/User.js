const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  avatar: { type: DataTypes.STRING(255), defaultValue: null },
  refreshToken: { type: DataTypes.TEXT, defaultValue: null },
}, { tableName: 'users', timestamps: true });