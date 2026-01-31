// db.js
const { Pool } = require("pg");
require("dotenv").config();

// Create a new PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // from Render environment variables
  ssl: {
    rejectUnauthorized: false // Required for Render Postgres
  }
});

// Optional: Test connection immediately
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ Error connecting to PostgreSQL:", err.message);
  });

module.exports = pool;
