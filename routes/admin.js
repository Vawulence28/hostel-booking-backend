const express = require("express");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleGuard");

const router = express.Router();

// VIEW USERS
router.get(
  "/users",
  auth,
  role("support_admin", "super_admin"),
  async (req, res) => {
    const users = await pool.query(
      "SELECT id, name, email, role FROM users"
    );
    res.json(users.rows);
  }
);

// VIEW BOOKINGS
router.get(
  "/bookings",
  auth,
  role("support_admin", "super_admin"),
  async (req, res) => {
    const bookings = await pool.query("SELECT * FROM bookings");
    res.json(bookings.rows);
  }
);

module.exports = router;
