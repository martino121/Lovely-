const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ======================
   MEMORY STORE
====================== */
const USERS = {};
const OTP_STORE = {};

/* ======================
   GMAIL CONFIG
====================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "merizindegi40@gmail.com",
    pass: "axnk ytuc ewzz jmic" // app password (spaces সহ)
  }
});

/* ======================
   API
====================== */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[email] = otp;

  console.log("OTP:", email, otp);

  try {
    await transporter.sendMail({
      from: "Chat App <merizindegi40@gmail.com>",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mail failed" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (OTP_STORE[email] !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete OTP_STORE[email];

  if (!USERS[email]) {
    USERS[email] = {
      id: crypto.randomUUID(),
      email
    };
  }

  res.json(USERS[email]);
});

/* ======================
   SOCKET CHAT
====================== */
io.on("connection", socket => {
  socket.on("send-message", msg => {
    const message = {
      id: crypto.randomUUID(),
      userName: msg.userName,
      text: msg.text,
      time: Date.now()
    };
    io.emit("new-message", message);
  });
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
