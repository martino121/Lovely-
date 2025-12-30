const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { accessToken, refreshToken } = require("../utils/token");
const jwt = require("jsonwebtoken");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 12);
  await User.create({ email: req.body.email, password: hash });
  res.json({ msg: "Registered" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ msg: "Invalid" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.status(401).json({ msg: "Invalid" });

  const at = accessToken(user._id);
  const rt = refreshToken(user._id);

  user.refreshToken = rt;
  await user.save();

  res.cookie("refreshToken", rt, {
    httpOnly: true,
    sameSite: "strict"
  });

  res.json({ accessToken: at });
});

// REFRESH
router.post("/refresh", async (req, res) => {
  const rt = req.cookies.refreshToken;
  if (!rt) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken: rt });
  if (!user) return res.sendStatus(403);

  jwt.verify(rt, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    res.json({ accessToken: accessToken(decoded.id) });
  });
});

// LOGOUT
router.post("/logout", async (req, res) => {
  await User.updateOne(
    { refreshToken: req.cookies.refreshToken },
    { refreshToken: null }
  );
  res.clearCookie("refreshToken");
  res.json({ msg: "Logged out" });
});

module.exports = router;
