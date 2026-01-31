const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleGuard");

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

// ADD HOSTEL
router.post(
  "/",
  auth,
  role("content_admin", "super_admin"),
  async (req, res) => {
    const { name, location, price, description, image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO hostels (name, location, price, description, image_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, location, price, description, image_url]
    );

    res.status(201).json(result.rows[0]);
  }
);

// DELETE HOSTEL
router.delete(
  "/:id",
  auth,
  role("content_admin", "super_admin"),
  async (req, res) => {
    await pool.query("DELETE FROM hostels WHERE id = $1", [req.params.id]);
    res.json({ message: "Hostel deleted" });
  }
);

module.exports = router;

