console.log("app.js loaded");

// connect socket
const socket = io("http://127.0.0.1:3000");

// ================================
// ===== ROOM STATE =====
// ================================
function getRoom() {
  return localStorage.getItem("ROOM") || "home";
}

function setRoom(room) {
  localStorage.setItem("ROOM", room);
}

// ================================
// ===== NAVIGATION =====
// ================================
async function goRoom(room) {
  setRoom(room);

  if (room === "notify") {
    await fetch("http://127.0.0.1:3000/notifications/seen", { method: "POST" });
  }

  renderRoom();
}

function renderRoom() {
  const room = getRoom();

  document.querySelectorAll(".room").forEach(r => {
    r.classList.add("hidden");
  });

  const active = document.getElementById(room);
  if (active) active.classList.remove("hidden");
}

// ================================
// ===== CHAT =====
// ================================
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  socket.emit("send-message", text);
  input.value = "";
}

// receive message instantly
socket.on("new-message", msg => {
  renderMessage(msg);
});

function renderMessage(m) {
  const box = document.getElementById("messages");
  if (!box) return;

  const div = document.createElement("div");
  div.className = "message";
  div.innerText =
    (m.userId === "TEMP_USER" ? "You" : "User") + ": " + m.text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// ================================
// ===== START =====
// ================================
renderRoom();
