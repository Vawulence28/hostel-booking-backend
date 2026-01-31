const express = require("express");
const router = express.Router();
const pool = require("../db"); // your PostgreSQL pool

// GET all available hostels
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hostels WHERE status = 'available' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ FETCH HOSTELS ERROR:", err);
    res.status(500).json({ error: "Server error fetching hostels", details: err.message });
  }
});

module.exports = router;
