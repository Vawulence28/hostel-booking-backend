// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const role = require("../middleware/roleGuard");
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================================
// Create Stripe Checkout Session
// ================================
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  const { hostelId } = req.body;

  try {
    // Fetch hostel details
    const hostelRes = await pool.query('SELECT * FROM hostels WHERE id = $1', [hostelId]);
    if (!hostelRes.rows.length) return res.status(404).json({ error: 'Hostel not found' });
    const hostel = hostelRes.rows[0];

    // Check if hostel is already booked
    if (hostel.status === 'Booked') {
      return res.status(400).json({ error: 'Hostel already booked' });
    }

    // Create a pending booking
    const bookingRes = await pool.query(
      'INSERT INTO bookings (user_id, hostel_id, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [req.user.id, hostel.id, 'Pending']
    );
    const booking = bookingRes.rows[0];

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: { name: hostel.name },
            unit_amount: hostel.price * 100 // convert to kobo
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success.html?bookingId=${booking.id}`,
      cancel_url: `${process.env.CLIENT_URL}/hostel.html?id=${hostel.id}`,
      metadata: {
        userId: req.user.id,
        hostelId: hostel.id,
        bookingId: booking.id
      }
    });

    // Insert payment record in `payments` table as Pending
    await pool.query(
      'INSERT INTO payments (booking_id, user_id, hostel_id, stripe_session_id, amount, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [booking.id, req.user.id, hostel.id, session.id, hostel.price, 'Pending']
    );

    res.json({ sessionId: session.id, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (err) {
    console.error('CREATE CHECKOUT SESSION ERROR:', err);
    res.status(500).json({ error: 'Server error creating checkout session' });
  }
});

// ================================
// Stripe Webhook to confirm payment
// ================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('STRIPE WEBHOOK ERROR:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, hostelId, bookingId } = session.metadata;

    try {
      // Update payment to Paid
      const paymentRes = await pool.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE stripe_session_id = $2 RETURNING *',
        ['Paid', session.id]
      );

      // Update booking to Paid
      const bookingRes = await pool.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        ['Paid', bookingId]
      );

      // Update hostel to Booked
      await pool.query(
        'UPDATE hostels SET status = $1 WHERE id = $2',
        ['Booked', hostelId]
      );

      console.log('Payment completed:', paymentRes.rows, bookingRes.rows);
    } catch (err) {
      console.error('UPDATE AFTER PAYMENT ERROR:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;


