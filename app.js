// ===== USER =====
function getUser() {
  return JSON.parse(localStorage.getItem("USER"));
}

function saveUser(user) {
  localStorage.setItem("USER", JSON.stringify(user));
}

// ===== ROOM SYSTEM =====
function goRoom(roomName) {
  const user = getUser();
  if (!user) return;

  user.state = roomName;   // 🧍 মানুষ কোথায় গেল
  saveUser(user);

  renderRoom();
}
if (roomName === "notify") {
  const list = getNotifications().map(n => {
    n.seen = true;
    return n;
  });
  saveNotifications(list);
  renderNotifications();
}

function renderRoom() {
  const user = getUser();
  if (!user) return;

  document.querySelectorAll(".room").forEach(r => {
    r.classList.add("hidden");
  });

  document.getElementById(user.state).classList.remove("hidden");
}

// ===== INIT =====
if (!getUser()) {
  localStorage.setItem("USER", JSON.stringify({
    id: crypto.randomUUID(),
    name: "Guest",
    state: "home"
  }));
}

renderRoom();
// ===== MESSAGE STORAGE =====
function getMessages() {
  return JSON.parse(localStorage.getItem("MESSAGES")) || [];
}

if (user.state === "notify") {
  renderNotifications();
}
function saveMessages(msgs) {
  localStorage.setItem("MESSAGES", JSON.stringify(msgs));
}

// ===== SEND MESSAGE =====
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  const user = getUser();
  if (!user) return;

  const messages = getMessages();

  const msg = {
    id: crypto.randomUUID(),
    userId: user.id,
    text: text,
    time: Date.now()
  };

  messages.push(msg);
  saveMessages(messages);
  
  createNotification("New message sent");

  input.value = "";
  renderMessages();
}

// ===== RENDER CHAT =====
function renderMessages() {
  const user = getUser();
  const messages = getMessages();
  const box = document.getElementById("messages");

  if (!box) return;

  box.innerHTML = "";

  messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message";

    // নিজের message হলে আলাদা look দিতে পারো
    div.innerText =
      (m.userId === user.id ? "You: " : "User: ") + m.text;

    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}
if (user.state === "chat") {
  renderMessages();
}
// ===== NOTIFICATION STORAGE =====
function getNotifications() {
  return JSON.parse(localStorage.getItem("NOTIFICATIONS")) || [];
}

function saveNotifications(list) {
  localStorage.setItem("NOTIFICATIONS", JSON.stringify(list));
}

// ===== CREATE NOTIFICATION =====
function createNotification(text) {
  const list = getNotifications();

  list.push({
    id: crypto.randomUUID(),
    text: text,
    time: Date.now(),
    seen: false
  });

  saveNotifications(list);
}

// ===== RENDER NOTIFICATIONS =====
function renderNotifications() {
  const list = getNotifications();
  const box = document.getElementById("notifyList");
  if (!box) return;

  box.innerHTML = "";

  list.forEach(n => {
    const div = document.createElement("div");
    div.className = "notification" + (n.seen ? "" : " new");
    div.innerText = n.text;
    box.appendChild(div);
  });
  }
