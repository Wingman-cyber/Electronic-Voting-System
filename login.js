// ================= IMPORTS =================
import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================= ELEMENTS =================
const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const passwordInput = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

const ADMIN_EMAIL = "iebc.ke26@gmail.com";

// ================= AUTO REDIRECT =================
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  if (user.email === ADMIN_EMAIL) {
    window.location.replace("admin-dashboard.html");
  } else {
    window.location.replace("dashboard.html");
  }
});

// ================= LOGIN =================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.innerText = "";

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      message.innerText = "Please enter both email and password.";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // ❌ No redirect here (handled by onAuthStateChanged)

    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/user-not-found":
          message.innerText = "No user found with this email.";
          break;
        case "auth/wrong-password":
          message.innerText = "Incorrect password.";
          break;
        case "auth/invalid-email":
          message.innerText = "Invalid email address.";
          break;
        case "auth/invalid-credential":
          message.innerText = "Wrong email or password.";
          break;
        default:
          message.innerText = error.message;
      }
    }
  });
}

// ================= SHOW / HIDE PASSWORD =================
if (toggle && passwordInput) {
  toggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "🙈 Hide" : "👁 Show";
  });
}