const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;
const DB_FILE = "./db.json";

// ===== DB =====
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], messages: [], notifications: [] })
    );
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/messages", (req, res) => {
  res.json(readDB().messages);
});

app.get("/notifications", (req, res) => {
  res.json(readDB().notifications);
});

app.post("/notifications/seen", (req, res) => {
  const db = readDB();
  db.notifications = db.notifications.map(n => ({ ...n, seen: true }));
  writeDB(db);
  res.json({ success: true });
});

// ===== SOCKET =====
io.on("connection", socket => {
  console.log("🟢 User connected");

  socket.on("send-message", text => {
    const db = readDB();

    const msg = {
      id: crypto.randomUUID(),
      userId: "USER",
      text,
      time: Date.now()
    };

    db.messages.push(msg);
    db.notifications.push({
      id: crypto.randomUUID(),
      text: "New message",
      seen: false,
      time: Date.now()
    });

    writeDB(db);

    io.emit("new-message", msg); // 🔥 real-time
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
