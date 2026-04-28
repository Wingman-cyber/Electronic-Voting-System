import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= ADMIN CONFIG =================
const ADMIN_EMAIL = "iebc.ke26@gmail.com";

// ================= GLOBAL =================
let barChart, pieChart;
let totalUsers = 1;

// Hide page before auth check
document.body.style.display = "none";

// ================= AUTH GUARD =================
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  // ❌ NOT ADMIN
  if (user.email !== ADMIN_EMAIL) {
    window.location.replace("dashboard.html");
    return;
  }

  // ✅ ADMIN OK
  document.body.style.display = "block";
  initAdmin(user);
});

// ================= INIT ADMIN =================
function initAdmin(user) {
  console.log("Admin:", user.email);

  const adminName = document.getElementById("adminName");
  if (adminName) adminName.textContent = user.email;

  setupLogout();
  setupNavigation();

  listenToUsers();
  loadLiveSystem(); // 🔥 THIS IS THE BIG ADD
}

// ================= LOGOUT =================
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);

    localStorage.clear();
    sessionStorage.clear();

    window.location.replace("login.html");
  });
}

// ================= NAVIGATION =================
function setupNavigation() {
  const nav = (id, url) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = url;
    });
  };

  nav("manageCandidatesBtn", "admin-candidates.html");
  nav("viewVotersBtn", "admin-voters.html");
  nav("settingsBtn", "admin-settings.html");
  nav("resultsBtn", "results.html");
}

// ================= USERS COUNT =================
function listenToUsers() {
  onSnapshot(collection(db, "users"), (snap) => {
    totalUsers = snap.size || 1;
  });
}

// ================= LIVE RESULTS =================
function loadLiveSystem() {
  onSnapshot(collection(db, "votes"), (snap) => {

    let totalVotes = 0;
    let candidateCount = {};
    let positionCount = {};
    let countyVotes = {};

    snap.forEach(doc => {
      const v = doc.data();

      totalVotes++;

      const candidate = v.candidate || "Unknown";
      const position = v.position || "Unknown";
      const county = v.county || "Unknown";

      // Candidate count
      candidateCount[candidate] =
        (candidateCount[candidate] || 0) + 1;

      // Position grouping
      positionCount[position] =
        (positionCount[position] || 0) + 1;

      // County stats
      countyVotes[county] =
        (countyVotes[county] || 0) + 1;
    });

    animateCounter("totalVotes", totalVotes);
    updateLeader(candidateCount);
    updateTopCandidates(candidateCount);
    updateTurnout(totalVotes);
    drawCharts(candidateCount, countyVotes);
  });
}

// ================= ANIMATE =================
function animateCounter(id, end) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;

  const step = () => {
    start += Math.ceil(end / 15);

    if (start >= end) {
      el.textContent = end;
    } else {
      el.textContent = start;
      requestAnimationFrame(step);
    }
  };

  step();
}

// ================= LEADER =================
function updateLeader(counts) {
  const box = document.getElementById("leaderBox");
  if (!box) return;

  if (Object.keys(counts).length === 0) {
    box.innerHTML = `<p>No votes yet</p>`;
    return;
  }

  let leader = "";
  let max = 0;
  let total = 0;

  for (let c in counts) {
    total += counts[c];
    if (counts[c] > max) {
      max = counts[c];
      leader = c;
    }
  }

  const percent = ((max / total) * 100).toFixed(1);

  box.innerHTML = `
    <h3>🏆 Leading Candidate</h3>
    <p><strong>${leader}</strong></p>
    <p>${max} votes (${percent}%)</p>
  `;
}

// ================= TOP CANDIDATES =================
function updateTopCandidates(counts) {
  const container = document.getElementById("topCandidates");
  if (!container) return;

  container.innerHTML = "";

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, votes]) => {
      const div = document.createElement("div");
      div.className = "candidate-item";

      div.innerHTML = `
        <span>${name}</span>
        <strong>${votes}</strong>
      `;

      container.appendChild(div);
    });
}

// ================= TURNOUT =================
function updateTurnout(totalVotes) {
  const el = document.getElementById("turnout");
  if (!el) return;

  const percent = ((totalVotes / totalUsers) * 100).toFixed(1);
  el.textContent = percent + "%";
}

// ================= CHARTS =================
function drawCharts(candidateCount, countyVotes) {

  const barCtx = document.getElementById("barChart");
  const pieCtx = document.getElementById("pieChart");

  if (!barCtx || !pieCtx) return;

  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: Object.keys(countyVotes),
      datasets: [{
        data: Object.values(countyVotes),
      }]
    }
  });

  pieChart = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(candidateCount),
      datasets: [{
        data: Object.values(candidateCount),
      }]
    }
  });
}