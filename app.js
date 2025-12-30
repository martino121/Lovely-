const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));
let CURRENT_EMAIL = null;

/* ======================
   OTP FLOW
====================== */

async function sendOTP() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) {
    alert("Enter Gmail");
    return;
  }

  CURRENT_EMAIL = email;

  const res = await fetch(API + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (data.success) {
    alert("OTP sent! Check Gmail / Spam");
    document.getElementById("otpBox").classList.remove("hidden");
  } else {
    alert("OTP send failed");
  }
}

async function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();
  if (!otp) {
    alert("Enter OTP");
    return;
  }

  const res = await fetch(API + "/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: CURRENT_EMAIL,
      otp
    })
  });

  const user = await res.json();

  if (user.error) {
    alert("Invalid OTP");
    return;
  }

  USER = user;
  localStorage.setItem("USER", JSON.stringify(USER));

  document.getElementById("login").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  document.getElementById("userEmail").innerText = USER.email;
}

/* ======================
   CHAT
====================== */

function sendMessage() {
  const text = document.getElementById("msgInput").value.trim();
  if (!text || !USER) return;

  socket.emit("send-message", {
    userName: USER.email,
    text
  });

  document.getElementById("msgInput").value = "";
}

socket.on("new-message", m => {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.innerText = `${m.userName}: ${m.text}`;
  box.appendChild(div);
});

/* ======================
   NAV
====================== */
function goRoom(room) {
  document.querySelectorAll(".room").forEach(r =>
    r.classList.add("hidden")
  );
  document.getElementById(room).classList.remove("hidden");
}
