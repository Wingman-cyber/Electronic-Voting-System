// index.js
import { auth } from "./firebase-init.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ CORRECT ADMIN EMAIL
const ADMIN_EMAIL = "iebc.ke26@gmail.com";

// ELEMENTS
const userEmailEl = document.getElementById("user-email");
const dashboardLink = document.getElementById("dashboardLink");
const navDashboard = document.getElementById("navDashboard");
const logoutBtn = document.getElementById("logout");

// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {

  // ❌ NOT LOGGED IN (stay on homepage, don't force redirect)
  if (!user) {
    if (userEmailEl) userEmailEl.textContent = "Guest";

    if (dashboardLink) dashboardLink.href = "login.html";
    if (navDashboard) navDashboard.href = "login.html";

    if (logoutBtn) logoutBtn.style.display = "none";

    return;
  }

  // ✅ LOGGED IN
  if (userEmailEl) userEmailEl.textContent = user.email;

  // 🔐 ADMIN
  if (user.email === ADMIN_EMAIL) {
    if (dashboardLink) dashboardLink.href = "admin-dashboard.html";
    if (navDashboard) navDashboard.href = "admin-dashboard.html";
  } 
  // 👤 NORMAL USER
  else {
    if (dashboardLink) dashboardLink.href = "dashboard.html";
    if (navDashboard) navDashboard.href = "dashboard.html";
  }

  if (logoutBtn) logoutBtn.style.display = "inline-block";
});


// ================= LOGOUT =================
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
}