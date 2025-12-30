const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= OTP STORE =================
const otpStore = {}; // { email: { otp, expires } }

// ================= MAIL SETUP =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.merizindegi40@gmail.com
    pass: process.env.axnk ytuc ewzz jmic
  }
});

// ================= API =================
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 min
  };

  try {
    await transporter.sendMail({
      from: `"Chat App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP send failed" });
  }
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const data = otpStore[email];

  if (!data) return res.status(400).json({ error: "OTP not found" });
  if (Date.now() > data.expires)
    return res.status(400).json({ error: "OTP expired" });
  if (otp !== data.otp)
    return res.status(400).json({ error: "Wrong OTP" });

  delete otpStore[email];

  res.json({
    success: true,
    user: {
      id: crypto.randomUUID(),
      email
    }
  });
});

// ================= SOCKET =================
io.on("connection", socket => {
  socket.on("send-message", msg => {
    io.emit("new-message", msg);
  });
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
