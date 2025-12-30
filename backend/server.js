const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

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

/* ===== API ===== */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const db = readDB();
  let user = db.users.find(u => u.name === name);

  if (!user) {
    user = { id: crypto.randomUUID(), name };
    db.users.push(user);
    writeDB(db);
  }

  res.json(user);
});

app.get("/messages", (req, res) => {
  res.json(readDB().messages);
});

/* ===== SOCKET ===== */
io.on("connection", socket => {
  socket.on("send-message", msg => {
    const db = readDB();
    const message = {
      id: crypto.randomUUID(),
      userId: msg.userId,
      userName: msg.userName,
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
