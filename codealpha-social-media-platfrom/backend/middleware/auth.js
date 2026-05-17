const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'No token. Authorization denied.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, email }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

module.exports = { protect };