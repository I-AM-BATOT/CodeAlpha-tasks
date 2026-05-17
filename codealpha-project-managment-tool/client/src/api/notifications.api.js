import api from './axiosInstance';
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markOneRead: (id) => api.patch(`/notifications/${id}/read`),
};