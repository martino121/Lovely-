const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));

// ================= OTP =================
async function sendOTP() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) return alert("Enter email");

  const res = await fetch(API + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("otpBox").classList.remove("hidden");
    alert("OTP sent to Gmail");
  } else {
    alert("OTP failed");
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
  if (!data.success) return alert(data.error);

  USER = data.user;
  localStorage.setItem("USER", JSON.stringify(USER));

  document.getElementById("login").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  document.getElementById("userEmail").innerText = USER.email;
}

// ================= CHAT =================
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  socket.emit("send-message", {
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
});
