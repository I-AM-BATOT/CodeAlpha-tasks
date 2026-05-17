
import api from './axiosInstance';

export const projectsAPI = {
  getAll:        ()              => api.get('/projects'),
  getOne:        (id)            => api.get(`/projects/${id}`),
  create:        (d)             => api.post('/projects', d),
  invite:        (id, email)     => api.post(`/projects/${id}/invite`, { email }),
  getMembers:    (id)            => api.get(`/projects/${id}/members`),
  removeMember:  (id, userId)    => api.delete(`/projects/${id}/members/${userId}`),
  delete:        (id)            => api.delete(`/projects/${id}`),
};

