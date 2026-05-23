import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE, withCredentials: true });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('ss_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use((r)=>r,(e)=>{
  if(e.response?.status===401){localStorage.removeItem('ss_token');localStorage.removeItem('ss_user');window.location.href='/login';}
  return Promise.reject(e);
});
export const authAPI={
  register:(d)=>api.post('/auth/register',d),login:(d)=>api.post('/auth/login',d),
  logout:()=>api.post('/auth/logout'),profile:()=>api.get('/auth/profile'),
  updateProfile:(d)=>api.put('/auth/profile',d),changePassword:(d)=>api.put('/auth/change-password',d),
};
export const meetingsAPI={
  create:(d)=>api.post('/meetings',d),getAll:()=>api.get('/meetings/my'),
  getById:(id)=>api.get(`/meetings/${id}`),getByRoom:(r)=>api.get(`/meetings/room/${r}`),
  join:(d)=>api.post('/meetings/join',d),leave:(id)=>api.post(`/meetings/${id}/leave`),
  end:(id)=>api.post(`/meetings/${id}/end`),participants:(id)=>api.get(`/meetings/${id}/participants`),
  updateState:(id,d)=>api.patch(`/meetings/${id}/state`,d),
};
export const messagesAPI={
  getAll:(mid,p)=>api.get(`/meetings/${mid}/messages`,{params:p}),
  delete:(id)=>api.delete(`/messages/${id}`),
};
export const filesAPI={
  upload:(fd,cb)=>api.post('/files/upload',fd,{headers:{'Content-Type':'multipart/form-data'},onUploadProgress:(e)=>cb?.(Math.round(e.loaded*100/e.total))}),
  getAll:(mid)=>api.get(`/meetings/${mid}/files`),
  download:(id)=>`${API_BASE}/files/${id}/download`,
};
export const whiteboardAPI={
  get:(mid)=>api.get(`/meetings/${mid}/whiteboard`),
  save:(mid,d)=>api.put(`/meetings/${mid}/whiteboard`,d),
  clear:(mid)=>api.delete(`/meetings/${mid}/whiteboard`),
};
export const notificationsAPI={
  getAll:()=>api.get('/notifications'),
  markRead:(id)=>api.patch(`/notifications/${id}/read`),
  markAllRead:()=>api.patch('/notifications/read-all'),
};
export default api;
