const API = "https://lovely-wg0f.onrender.com";

// ===== ROOM STATE =====
function getRoom() {
  return localStorage.getItem("ROOM") || "home";
}

function setRoom(room) {
  localStorage.setItem("ROOM", room);
}

// ===== NAVIGATION =====
async function goRoom(room) {
  setRoom(room);

  if (room === "notify") {
    await fetch(API + "/notifications/seen", { method: "POST" });
  }

  renderRoom();
}

function renderRoom() {
  const room = getRoom();

  document.querySelectorAll(".room").forEach(r =>
    r.classList.add("hidden")
  );

  const active = document.getElementById(room);
  if (active) active.classList.remove("hidden");

  if (room === "chat") loadMessages();
  if (room === "notify") loadNotifications();
}

// ===== CHAT =====
async function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  await fetch(API + "/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "TEMP_USER",
      text
    })
  });

  input.value = "";
  loadMessages();
}

async function loadMessages() {
  const res = await fetch(API + "/messages");
  const messages = await res.json();

  const box = document.getElementById("messages");
  box.innerHTML = "";

  messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerText = "User: " + m.text;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
  const res = await fetch(API + "/notifications");
  const list = await res.json();

  const box = document.getElementById("notifyList");
  box.innerHTML = "";

  list.forEach(n => {
    const div = document.createElement("div");
    div.className = "notification" + (n.seen ? "" : " new");
    div.innerText = n.text;
    box.appendChild(div);
  });
}

// ===== START =====
renderRoom();
