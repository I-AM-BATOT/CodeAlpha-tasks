import api from './axiosInstance';
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  create: (taskId, text) => api.post(`/comments/task/${taskId}`, { text }),
};