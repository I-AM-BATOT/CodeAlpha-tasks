require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5000'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ShopEase running at http://localhost:${PORT}`);
});