
const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { User } = require('../models');

module.exports = {
  register: async ({ name, email, password }) => {
    if (await userRepo.findByEmail(email))
      throw { status: 409, message: 'Email already registered' };
    const hashed = await bcrypt.hash(password, 12);
    const user = await userRepo.create({ name, email, password: hashed });
    return { id: user.id, name: user.name, email: user.email };
  },

  login: async ({ email, password }) => {
    const user = await userRepo.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw { status: 401, message: 'Invalid email or password' };
    const payload = { id: user.id, email: user.email };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await userRepo.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } };
  },

  refresh: async (token) => {
    if (!token) throw { status: 401, message: 'Refresh token required' };
    let decoded;
    try { decoded = verifyRefreshToken(token); }
    catch { throw { status: 403, message: 'Invalid refresh token' }; }
    const user = await userRepo.findByRefreshToken(token);
    if (!user) throw { status: 403, message: 'Token revoked' };
    return { accessToken: signAccessToken({ id: user.id, email: user.email }) };
  },

  logout: async (userId) => userRepo.updateRefreshToken(userId, null),

  getMe: async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  updateProfile: async (userId, { name, email }) => {
    const updates = {};
    if (name?.trim())  updates.name  = name.trim();
    if (email?.trim()) updates.email = email.trim();
    if (!Object.keys(updates).length)
      throw { status: 400, message: 'Nothing to update' };
    // Check email not taken by another user
    if (updates.email) {
      const existing = await userRepo.findByEmail(updates.email);
      if (existing && String(existing.id) !== String(userId))
        throw { status: 409, message: 'Email already in use' };
    }
    await User.update(updates, { where: { id: userId } });
    return userRepo.findById(userId);
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword)
      throw { status: 400, message: 'Both current and new password are required' };
    if (newPassword.length < 6)
      throw { status: 400, message: 'New password must be at least 6 characters' };
    const user = await userRepo.findByEmail(
      (await userRepo.findById(userId))?.email
    );
    const rawUser = await User.findByPk(userId);
    if (!rawUser) throw { status: 404, message: 'User not found' };
    const valid = await bcrypt.compare(currentPassword, rawUser.password);
    if (!valid) throw { status: 401, message: 'Current password is incorrect' };
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.update({ password: hashed }, { where: { id: userId } });
  },
};

