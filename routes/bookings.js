// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// CREATE BOOKING
router.post('/', verifyToken, async (req, res) => {
  const { hostelId } = req.body;
  try {
    // Check if hostel already booked
    const bookedCheck = await pool.query(
      'SELECT * FROM bookings WHERE hostel_id = $1 AND status = $2',
      [hostelId, 'Paid']
    );
    if (bookedCheck.rows.length) return res.status(400).json({ error: 'Hostel already booked' });

    const result = await pool.query(
      'INSERT INTO bookings (user_id, hostel_id, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [req.user.id, hostelId, 'Pending']
    );

    res.status(201).json({ message: 'Booking created', booking: result.rows[0] });
  } catch (err) {
    console.error('CREATE BOOKING ERROR:', err);
    res.status(500).json({ error: 'Server error while creating booking' });
  }
});

// GET ALL BOOKINGS (ADMIN)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT b.id, b.status, b.created_at, u.name AS user_name, u.email AS user_email,
              h.name AS hostel_name, h.price
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN hostels h ON b.hostel_id = h.id
       ORDER BY b.created_at DESC`
    );
    res.json(bookings.rows);
  } catch (err) {
    console.error('FETCH BOOKINGS ERROR:', err);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

// UPDATE BOOKING STATUS (ADMIN)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body; // e.g., 'Paid' or 'Cancelled'
  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );
    res.json({ message: 'Booking status updated', booking: result.rows[0] });
  } catch (err) {
    console.error('UPDATE BOOKING ERROR:', err);
    res.status(500).json({ error: 'Server error while updating booking' });
  }
});

module.exports = router;
