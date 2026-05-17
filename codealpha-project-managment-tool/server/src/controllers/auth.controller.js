
const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

module.exports = {
  register: async (req, res, next) => {
    try { success(res, await authService.register(req.body), 'Registered', 201); }
    catch (err) { next(err); }
  },
  login: async (req, res, next) => {
    try {
      const data = await authService.login(req.body);
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true, maxAge: 7*24*60*60*1000, sameSite: 'lax'
      });
      success(res, { accessToken: data.accessToken, user: data.user });
    }
    catch (err) { next(err); }
  },
  refresh: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      success(res, await authService.refresh(token));
    }
    catch (err) { next(err); }
  },
  logout: async (req, res, next) => {
    try {
      await authService.logout(req.user.id);
      res.clearCookie('refreshToken');
      success(res, null, 'Logged out');
    }
    catch (err) { next(err); }
  },
  getMe: async (req, res, next) => {
    try { success(res, await authService.getMe(req.user.id)); }
    catch (err) { next(err); }
  },
  updateProfile: async (req, res, next) => {
    try { success(res, await authService.updateProfile(req.user.id, req.body)); }
    catch (err) { next(err); }
  },
  changePassword: async (req, res, next) => {
    try {
      await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      success(res, null, 'Password changed successfully');
    }
    catch (err) { next(err); }
  },
};

