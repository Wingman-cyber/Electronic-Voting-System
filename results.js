// ================= IMPORTS =================
import { db } from "./firebase-init.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= GLOBAL STATE =================
let currentPosition = "";
let unsubscribe = null;

// ================= LOAD RESULTS =================
window.loadResults = function(position) {
  currentPosition = position;

  const container = document.getElementById("resultsContainer");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("emptyState");
  const placeholder = document.getElementById("placeholder");

  // UI states
  placeholder.style.display = "none";
  emptyState.style.display = "none";
  loading.style.display = "block";

  // IMPORTANT: rebuild UI
  container.innerHTML = `
    <h2 class="position-title">${position.toUpperCase()} Results</h2>
    <div class="results-grid" id="resultsGrid"></div>
  `;

  const grid = document.getElementById("resultsGrid");

  // Stop previous listener
  if (unsubscribe) unsubscribe();

  // ================= REAL-TIME LISTENER =================
  unsubscribe = onSnapshot(collection(db, "votes"), (snapshot) => {

    console.log("Snapshot received:", snapshot.size);

    let counts = {};
    let totalVotes = 0;

    snapshot.forEach(doc => {
      const vote = doc.data();

      if (!vote || !vote.position || !vote.candidate) return;

      // FIX: case + spacing safety
      if ((vote.position || "").trim().toLowerCase() !== position.trim().toLowerCase()) {
        return;
      }

      const candidate = vote.candidate;

      counts[candidate] = (counts[candidate] || 0) + 1;
      totalVotes++;
    });

    loading.style.display = "none";

    // ================= EMPTY STATE =================
    if (totalVotes === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // ================= FIND WINNER =================
    let winner = "";
    let maxVotes = 0;

    Object.entries(counts).forEach(([candidate, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = candidate;
      }
    });

    // ================= RENDER RESULTS =================
    grid.innerHTML = "";

    Object.entries(counts).forEach(([candidate, votes]) => {

      const percent = ((votes / totalVotes) * 100).toFixed(1);
      const isWinner = candidate === winner;

      grid.innerHTML += `
        <div class="result-card ${isWinner ? "winner" : ""}">

          ${isWinner ? `<div class="winner-badge">🏆 Leading</div>` : ""}

          <h3>${candidate}</h3>

          <p>${votes} votes</p>

          <span>${percent}%</span>

          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>

        </div>
      `;
    });

  }, (error) => {
    console.error("Error loading results:", error);

    loading.style.display = "none";

    if (grid) {
      grid.innerHTML = "<p>Error loading results</p>";
    }
  });
};