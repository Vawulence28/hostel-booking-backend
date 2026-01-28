// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT VERIFY ERROR:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { id, email, role, name }
    next();
  });
};

// Middleware to allow only admins
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
