const { User } = require('../models');

module.exports = {
  findByEmail: (email) => User.findOne({ where: { email } }),
  findById: (id) => User.findByPk(id, { attributes: { exclude: ['password','refreshToken'] } }),
  create: (data) => User.create(data),
  updateRefreshToken: (id, token) => User.update({ refreshToken: token }, { where: { id } }),
  findByRefreshToken: (token) => User.findOne({ where: { refreshToken: token } }),
};