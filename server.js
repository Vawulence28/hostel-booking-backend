// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const hostelRoutes = require('./routes/hostels');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

app.use('/auth', authRoutes);
app.use('/hostels', hostelRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

// Root test
app.get('/', (req, res) => res.send('Hostel Booking Backend Running'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ error: 'Server error occurred' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
