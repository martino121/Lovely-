console.log("app.js loaded");

// 🔗 YOUR RENDER BACKEND URL
const BACKEND_URL = "https://lovely-wg0f.onrender.com";

// socket connect
const socket = io(BACKEND_URL);

// ===== ROOM =====
function getRoom() {
  return localStorage.getItem("ROOM") || "home";
}

function setRoom(room) {
  localStorage.setItem("ROOM", room);
}

async function goRoom(room) {
  setRoom(room);

  if (room === "notify") {
    await fetch(`${BACKEND_URL}/notifications/seen`, { method: "POST" });
  }

  renderRoom();
}

function renderRoom() {
  const room = getRoom();
  document.querySelectorAll(".room").forEach(r => r.classList.add("hidden"));
  const active = document.getElementById(room);
  if (active) active.classList.remove("hidden");
}

// ===== CHAT =====
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;
  socket.emit("send-message", text);
  input.value = "";
}

socket.on("new-message", msg => {
  renderMessage(msg);
});

function renderMessage(m) {
  const box = document.getElementById("messages");
  if (!box) return;

  const div = document.createElement("div");
  div.className = "message";
  div.innerText = "User: " + m.text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// ===== LOAD OLD MESSAGES =====
async function loadMessages() {
  const res = await fetch(`${BACKEND_URL}/messages`);
  const msgs = await res.json();
  msgs.forEach(renderMessage);
}

loadMessages();
renderRoom();
