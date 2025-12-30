const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = "./db.json";

/* ===== DB ===== */
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], messages: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* ===== OTP STORE ===== */
const OTP_STORE = {};

/* ===== MAIL ===== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

/* ===== SEND OTP ===== */
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  OTP_STORE[email] = {
    otp,
    expires: Date.now() + 2 * 60 * 1000
  };

  await transporter.sendMail({
    from: `"Chat App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Login OTP",
    text: `Your OTP is ${otp}. Valid for 2 minutes.`
  });

  res.json({ success: true });
});

/* ===== VERIFY OTP ===== */
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = OTP_STORE[email];

  if (!record) return res.status(400).json({ error: "OTP not found" });
  if (Date.now() > record.expires)
    return res.status(400).json({ error: "OTP expired" });
  if (String(record.otp) !== String(otp))
    return res.status(400).json({ error: "Invalid OTP" });

  delete OTP_STORE[email];

  const db = readDB();
  let user = db.users.find(u => u.email === email);

  if (!user) {
    user = { id: crypto.randomUUID(), email };
    db.users.push(user);
    writeDB(db);
  }

  res.json(user);
});

/* ===== SOCKET CHAT ===== */
io.on("connection", socket => {
  socket.on("send-message", msg => {
    const db = readDB();
    const message = {
      id: crypto.randomUUID(),
      userId: msg.userId,
      email: msg.email,
      text: msg.text,
      time: Date.now()
    };
    db.messages.push(message);
    writeDB(db);
    io.emit("new-message", message);
  });
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
