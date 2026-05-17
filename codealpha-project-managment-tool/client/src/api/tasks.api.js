import api from './axiosInstance';
export const tasksAPI = {
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (d) => api.post('/tasks', d),
  update: (id, d) => api.patch(`/tasks/${id}`, d),
  move: (id, boardId) => api.patch(`/tasks/${id}/move`, { boardId }),
  delete: (id) => api.delete(`/tasks/${id}`),
};