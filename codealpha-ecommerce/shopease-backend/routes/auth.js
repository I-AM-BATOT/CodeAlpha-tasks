const express     = require('express');
const jwt         = require('jsonwebtoken');
const bcrypt      = require('bcryptjs');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');
const router      = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required.' });

    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: 'Email already registered.' });

    // Hash password manually here
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user  = await User.create({ name, email, password: hashedPassword, phone });
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;