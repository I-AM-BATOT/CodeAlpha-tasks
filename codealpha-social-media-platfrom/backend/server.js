const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes    = require('./routes/likes');
const followRoutes  = require('./routes/follows');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve frontend — using process.cwd() to always resolve from project root
app.use(express.static(path.join(process.cwd(), 'frontend')));

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes',    likeRoutes);
app.use('/api/follows',  followRoutes);

// Root → always redirect to login
app.get('/', (req, res) => {
  res.redirect('/pages/login.html');
});

// Catch any unknown non-API route → redirect to login
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.startsWith('/pages') || req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/uploads') || req.path.startsWith('/logo')) return next();
  res.redirect('/pages/login.html');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ConnectSphere running on http://localhost:${PORT}`));