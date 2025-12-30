const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));

/* ======================
   OTP LOGIN
====================== */
async function sendOTP() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) return alert("Enter Gmail");

  const res = await fetch(API + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("otpBox").classList.remove("hidden");
    alert("OTP sent. Check Inbox / Spam");
  } else {
    alert("OTP send failed");
  }
}

async function verifyOTP() {
  const email = document.getElementById("emailInput").value.trim();
  const otp = document.getElementById("otpInput").value.trim();

  const res = await fetch(API + "/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  USER = data;
  localStorage.setItem("USER", JSON.stringify(USER));

  document.getElementById("userEmail").innerText = USER.email;
  goRoom("home");
}

/* ======================
   ROOM SYSTEM
====================== */
function goRoom(room) {
  document.querySelectorAll(".room").forEach(r =>
    r.classList.add("hidden")
  );
  document.getElementById(room).classList.remove("hidden");
}

/* ======================
   CHAT
====================== */
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text || !USER) return;

  socket.emit("send-message", {
    userName: USER.email,
    text
  });

  input.value = "";
}

socket.on("new-message", m => {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `${m.userName}: ${m.text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});

/* ======================
   AUTO LOGIN
====================== */
if (USER) {
  document.getElementById("userEmail").innerText = USER.email;
  goRoom("home");
}
