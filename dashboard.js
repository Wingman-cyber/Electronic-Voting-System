import { auth, db } from "./firebase-init.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let barChart, pieChart;
let totalUsers = 1;
let hasVoted = false;

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User not found");
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    const data = userSnap.data();

    // PROFILE
    setText("userName", data.name);
    setText("userCounty", data.county);
    setText("userAge", data.age);
    setText("userId", user.uid);

    // TOP STATS
    setText("userNameTop", data.name);
    setText("userAgeTop", data.age);

    checkIfVoted(user.uid);
    listenToUsers();
    loadLiveSystem(data.county);

  } catch (error) {
    console.error("Auth error:", error);
  }
});

// ================= HELPERS =================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "N/A";
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutNav");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      await signOut(auth); // 🔥 proper Firebase logout

      localStorage.clear();
      sessionStorage.clear();

      window.location.replace("login.html");

    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

// ================= ANIMATED COUNTER =================
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

// ================= CHECK VOTE =================
// ================= CHECK VOTE =================
function checkIfVoted(uid) {

  // 🔥 Define ALL required positions here
  const requiredPositions = [
    "president",
    "governor",
    "mp",
    "senator",
    "women_rep",
    "mca"
  ];

  const voteQuery = query(
    collection(db, "votes"),
    where("userId", "==", uid)
  );

  onSnapshot(voteQuery, (snap) => {

    const votedPositions = new Set();

    snap.forEach(doc => {
      const vote = doc.data();
      votedPositions.add(vote.position);
    });

    // ✅ Check if ALL positions are voted
    hasVoted = requiredPositions.every(pos => votedPositions.has(pos));

    const statusEl = document.getElementById("voteStatus");
    const topStatus = document.getElementById("voteStatusTop");
    const btn = document.getElementById("voteBtn");

    if (!statusEl || !btn) return;

    if (hasVoted) {
      statusEl.textContent = "Voted ✅";
      topStatus.textContent = "Voted";

      btn.disabled = true;
      btn.textContent = "All Votes Submitted";
    } else {
      statusEl.textContent = `Voting... (${votedPositions.size}/${requiredPositions.length})`;
      topStatus.textContent = "In Progress";
    }
  });
}

// ================= USERS =================
function listenToUsers() {
  onSnapshot(collection(db, "users"), (snap) => {
    totalUsers = snap.size || 1;
  });
}

// ================= LIVE SYSTEM =================
function loadLiveSystem(userCounty) {
  onSnapshot(collection(db, "votes"), (voteSnap) => {
    let totalVotes = 0;
    let candidateCount = {};
    let countyVotes = {};

    voteSnap.forEach((doc) => {
      const v = doc.data();

      totalVotes++;

      const candidate = v.candidate || "Unknown";
      const county = v.county || "Unknown";

      candidateCount[candidate] =
        (candidateCount[candidate] || 0) + 1;

      countyVotes[county] =
        (countyVotes[county] || 0) + 1;
    });

    animateCounter("totalVotes", totalVotes);
    updateLeader(candidateCount);
    updatePositionLeaders(candidateCount);
    drawCharts(candidateCount, countyVotes);
    updateTurnout(totalVotes);
    highlightUserCounty(userCounty, countyVotes);
  });
}

// ================= LEADER =================
function updateLeader(counts) {
  const box = document.getElementById("leaderBox");
  if (!box) return;

  if (Object.keys(counts).length === 0) {
    box.innerHTML = `<h3>🏆 Leading Candidate</h3><p>No votes yet</p>`;
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

// ================= POSITION LEADERS =================
function updatePositionLeaders(counts) {
  const container = document.getElementById("positionLeaders");
  if (!container) return;

  container.innerHTML = `<h3>📌 Position Leaders</h3>`;

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, votes]) => {
      const div = document.createElement("div");
      div.className = "position-item";
      div.innerHTML = `
        <span>${name}</span>
        <strong>${votes}</strong>
      `;
      container.appendChild(div);
    });
}

// ================= COUNTY =================
function highlightUserCounty(userCounty, countyVotes) {
  const el = document.getElementById("userCountyTop");
  if (!el) return;

  const votes = countyVotes[userCounty] || 0;
  el.textContent = `${userCounty} (${votes})`;
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

// ================= TURNOUT =================
function updateTurnout(totalVotes) {
  const el = document.getElementById("turnout");
  if (!el) return;

  const percent = ((totalVotes / totalUsers) * 100).toFixed(1);
  el.textContent = percent + "%";
}