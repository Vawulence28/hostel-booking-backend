const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 🔥 TEST ROUTE (CRITICAL)
app.get("/test", (req, res) => {
  res.json({ message: "Server routes are working" });
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// 🔥 HOSTELS ROUTE
const hostelsRoutes = require("./routes/hostels");
app.use("/api/hostels", hostelsRoutes);

// root
app.get("/", (req, res) => {
  res.send("Hostel Booking Backend Running");
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

