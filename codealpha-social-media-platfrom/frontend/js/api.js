const BASE = '/api';

// ── Token helpers ──
const getToken = () => localStorage.getItem('cs_token');
const setToken = (t) => localStorage.setItem('cs_token', t);
const setUser  = (u) => localStorage.setItem('cs_user', JSON.stringify(u));
const getUser  = ()  => JSON.parse(localStorage.getItem('cs_user') || 'null');
const logout   = ()  => { localStorage.removeItem('cs_token'); localStorage.removeItem('cs_user'); window.location = '/pages/login.html'; window.location.reload(); };

// ── Base fetch ──
async function api(endpoint, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let fetchBody;
  if (formData) {
    fetchBody = formData; // multipart
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${endpoint}`, { method, headers, body: fetchBody });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ──
const Auth = {
  register: (d) => api('/auth/register', { method: 'POST', body: d }),
  login:    (d) => api('/auth/login',    { method: 'POST', body: d }),
  me:       ()  => api('/auth/me'),
};

// ── Posts ──
const Posts = {
  feed:          ()      => api('/posts'),
  followingFeed: ()      => api('/posts/following'),
  userPosts:     (uid)   => api(`/posts/user/${uid}`),
  create:        (fd)    => api('/posts', { method: 'POST', formData: fd }),
  update:        (id, d) => api(`/posts/${id}`, { method: 'PUT', body: d }),
  delete:        (id)    => api(`/posts/${id}`, { method: 'DELETE' }),
};

// ── Comments ──
const Comments = {
  get:    (pid)      => api(`/comments/${pid}`),
  add:    (pid, d)   => api(`/comments/${pid}`, { method: 'POST', body: d }),
  delete: (id)       => api(`/comments/${id}`, { method: 'DELETE' }),
};

// ── Likes ──
const Likes = {
  toggle: (pid) => api(`/likes/${pid}`, { method: 'POST' }),
};

// ── Users ──
const Users = {
  profile: (id)  => api(`/users/${id}`),
  update:  (fd)  => api('/users/profile', { method: 'PUT', formData: fd }),
  search:  (q)   => api(`/users/search?q=${encodeURIComponent(q)}`),
};

// ── Follows ──
const Follows = {
  toggle: (uid)  => api(`/follows/${uid}`, { method: 'POST' }),
  status: (uid)  => api(`/follows/${uid}/status`),
};

// ── Toast ──
function toast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ── Avatar helper ──
function avatarEl(user, size = 42) {
  const wrap = document.createElement('div');
  wrap.className = 'avatar';
  wrap.style.width  = size + 'px';
  wrap.style.height = size + 'px';
  if (user.profile_pic) {
    const img = document.createElement('img');
    img.src = user.profile_pic;
    img.alt = user.username;
    wrap.appendChild(img);
  } else {
    wrap.textContent = (user.username || '?')[0].toUpperCase();
  }
  return wrap;
}

// ── Time format ──
function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// Guard: redirect to login if not authenticated
async function requireAuth() {
  if (!getToken()) { window.location.replace('/pages/login.html'); return false; }
  try {
    await Auth.me(); // verify token is still valid with server
    return true;
  } catch (e) {
    logout();
    return false;
  }
}