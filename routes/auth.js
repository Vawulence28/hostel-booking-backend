// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, role: user.role, name: user.name });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
