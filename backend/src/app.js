// src/app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");

const app = express();

// security headers
app.use(helmet());

// body parser
app.use(express.json());

// cookies
app.use(cookieParser());

// cors
app.use(cors({
  origin: true,
  credentials: true
}));

// rate limit for auth routes
app.use("/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// routes
app.use("/auth", authRoutes);

// health check
app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;
