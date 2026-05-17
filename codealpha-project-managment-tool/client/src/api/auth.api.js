
import api from './axiosInstance';

export const authAPI = {
  register:       (d)  => api.post('/auth/register', d),
  login:          (d)  => api.post('/auth/login', d),
  logout:         ()   => api.post('/auth/logout'),
  me:             ()   => api.get('/auth/me'),
  updateProfile:  (d)  => api.patch('/auth/profile', d),
  changePassword: (d)  => api.patch('/auth/change-password', d),
};
