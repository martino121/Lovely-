const API = "https://lovely-wg0f.onrender.com";
const socket = io(API);

let USER = JSON.parse(localStorage.getItem("USER"));
let TEMP_EMAIL = null;

/* =====================
   OTP LOGIN
===================== */
async function sendOTP() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) return alert("Enter Gmail");

  const res = await fetch(API + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (res.ok) {
    TEMP_EMAIL = email;
    document.getElementById("otpBox").classList.remove("hidden");
    document.getElementById("loginMsg").innerText = "OTP sent to Gmail";
  } else {
    alert(data.error || "OTP failed");
  }
}

async function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();
  if (!otp) return alert("Enter OTP");

  const res = await fetch(API + "/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEMP_EMAIL, otp })
  });

  const user = await res.json();

  if (!res.ok) return alert(user.error || "OTP wrong");

  USER = user;
  localStorage.setItem("USER", JSON.stringify(USER));

  document.getElementById("login").classList.add("hidden");
  document.getElementById("nav").classList.remove("hidden");
  document.getElementById("userEmail").innerText = USER.email;

  goRoom("home");
}

/* =====================
   ROOM NAV
===================== */
function goRoom(room) {
  document.querySelectorAll(".room").forEach(r => r.classList.add("hidden"));
  document.getElementById(room).classList.remove("hidden");
}

/* =====================
   CHAT
===================== */
function sendMessage() {
  const text = document.getElementById("msgInput").value.trim();
  if (!text) return;

  socket.emit("send-message", {
    userId: USER.id,
    userName: USER.email,
    text
  });

  document.getElementById("msgInput").value = "";
}

socket.on("new-message", m => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerText = `${m.userName}: ${m.text}`;
  document.getElementById("messages").appendChild(div);
});

/* =====================
   AUTO LOGIN
===================== */
if (USER) {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("nav").classList.remove("hidden");
  document.getElementById("userEmail").innerText = USER.email;
  goRoom("home");
}
