const express = require("express");
const router = express.Router();
const pool = require("../db");

// TEST INSIDE ROUTE FILE
router.get("/test", (req, res) => {
  res.json({ message: "Hostels route works" });
});

// GET ALL HOSTELS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hostels");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ HOSTELS QUERY ERROR:", err);
    res.status(500).json({ error: "Server error fetching hostels" });
  }
});

module.exports = router;
