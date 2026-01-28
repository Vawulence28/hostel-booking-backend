// backend/routes/hostels.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET all hostels (with optional search)
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM hostels';
    const params = [];
    if (search) {
      query += ' WHERE name ILIKE $1 OR location ILIKE $1';
      params.push(`%${search}%`);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('FETCH HOSTELS ERROR:', err);
    res.status(500).json({ error: 'Server error fetching hostels' });
  }
});

// GET single hostel details
router.get('/:id', async (req, res) => {
  const hostelId = req.params.id;
  try {
    const hostelRes = await pool.query('SELECT * FROM hostels WHERE id = $1', [hostelId]);
    if (!hostelRes.rows.length) return res.status(404).json({ error: 'Hostel not found' });

    const hostel = hostelRes.rows[0];
    hostel.images = hostel.images || []; // Ensure images array exists
    res.json(hostel);
  } catch (err) {
    console.error('FETCH HOSTEL ERROR:', err);
    res.status(500).json({ error: 'Server error fetching hostel' });
  }
});

// ADMIN: Upload hostel
router.post('/', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
  const { name, location, price, description } = req.body;
  const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

  try {
    const result = await pool.query(
      'INSERT INTO hostels (name, location, price, description, images, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, location, price, description, imagePaths]
    );
    res.status(201).json({ message: 'Hostel uploaded', hostel: result.rows[0] });
  } catch (err) {
    console.error('UPLOAD HOSTEL ERROR:', err);
    res.status(500).json({ error: 'Server error uploading hostel' });
  }
});

module.exports = router;
