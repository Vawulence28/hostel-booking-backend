const express = require("express");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleGuard");

const router = express.Router();

// VIEW PAYMENTS
router.get(
  "/",
  auth,
  role("financial_admin", "super_admin"),
  async (req, res) => {
    const payments = await pool.query("SELECT * FROM payments");
    res.json(payments.rows);
  }
);

module.exports = router;
