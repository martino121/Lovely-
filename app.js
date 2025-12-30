const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));

/* ================= LOGIN OTP ================= */

async function sendOTP() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) return alert("Enter your Gmail");

  await fetch(API + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  document.getElementById("otpBox").classList.remove("hidden");
  alert("OTP sent to your Gmail");
}

async function verifyOTP() {
  const email = document.getElementById("emailInput").value.trim();
  const otp = document.getElementById("otpInput").value.trim();
  if (!otp) return alert("Enter OTP");

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

/* ================= ROOMS ================= */

function goRoom(room) {
  document.querySelectorAll(".room").forEach(r =>
    r.classList.add("hidden")
  );
  document.getElementById(room).classList.remove("hidden");
}

/* ================= CHAT ================= */

function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  socket.emit("send-message", {
    userId: USER.id,
    email: USER.email,
    text
  });

  input.value = "";
}

socket.on("new-message", m => {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `${m.email}: ${m.text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});

/* ================= START ================= */

if (USER) {
  document.getElementById("userEmail").innerText = USER.email;
  goRoom("home");
} else {
  goRoom("login");
}
