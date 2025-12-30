/* ===============================
   CONFIG
================================ */
const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));

/* ===============================
   LOGIN
================================ */
async function login() {
  const name = prompt("Enter your name");
  if (!name) return;

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  USER = await res.json();
  localStorage.setItem("USER", JSON.stringify(USER));

  alert("Logged in as " + USER.name);
  renderRoom();
}

if (!USER) {
  login();
}

/* ===============================
   ROOM NAVIGATION
================================ */
function getRoom() {
  return localStorage.getItem("ROOM") || "home";
}

function setRoom(room) {
  localStorage.setItem("ROOM", room);
}

function goRoom(room) {
  setRoom(room);
  renderRoom();
}

function renderRoom() {
  document.querySelectorAll(".room").forEach(r =>
    r.classList.add("hidden")
  );

  const active = document.getElementById(getRoom());
  if (active) active.classList.remove("hidden");
}

/* ===============================
   CHAT
================================ */
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text || !USER) return;

  socket.emit("send-message", {
    userId: USER.id,
    userName: USER.name,
    text
  });

  input.value = "";
}

socket.on("new-message", m => {
  const box = document.getElementById("messages");
  if (!box) return;

  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `${m.userName}: ${m.text}`;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});

/* ===============================
   START
================================ */
renderRoom();
