import api from './axiosInstance';
export const boardsAPI = {
  getByProject: (projectId) => api.get(`/boards/project/${projectId}`),
  create: (d) => api.post('/boards', d),
  update: (id, d) => api.patch(`/boards/${id}`, d),
  delete: (id) => api.delete(`/boards/${id}`),
};