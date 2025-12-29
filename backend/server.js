const express = require("express");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = "./db.json";

// ===== helper =====
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], messages: [], notifications: [] })
    );
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Login / Register
app.post("/user", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const db = readDB();
  let user = db.users.find(u => u.name === name);

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now()
    };
    db.users.push(user);
    writeDB(db);
  }

  res.json(user);
});

// Send message
app.post("/message", (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text)
    return res.status(400).json({ error: "Invalid message" });

  const db = readDB();

  db.messages.push({
    id: crypto.randomUUID(),
    userId,
    text,
    time: Date.now()
  });

  db.notifications.push({
    id: crypto.randomUUID(),
    text: `New message from ${userId}`,
    time: Date.now(),
    seen: false
  });

  writeDB(db);
  res.json({ success: true });
});

// Get messages
app.get("/messages", (req, res) => {
  const db = readDB();
  res.json(db.messages);
});

// Notifications
app.get("/notifications", (req, res) => {
  const db = readDB();
  res.json(db.notifications);
});

app.post("/notifications/seen", (req, res) => {
  const db = readDB();
  db.notifications = db.notifications.map(n => ({ ...n, seen: true }));
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
