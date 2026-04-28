import { db } from "./firebase-init.js";
import { collection, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 get all candidates
const colRef = collection(db, "candidates");

onSnapshot(colRef, (snapshot) => {
  const list = document.getElementById("candidateList");
  list.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();

    list.innerHTML += `
      <div class="card">
        <b>${c.name}</b><br>
        Party: ${c.party}<br>
        Position: ${c.position}<br>
        County: ${c.county}<br>

        <!-- 🔥 THIS connects to vote.js -->
        <button 
          class="voteBtn"
          data-candidate="${c.name}"
          data-position="${c.position}">
          Vote
        </button>
      </div>
    `;
  });

  // 🔥 attach voting logic AFTER rendering
  if (typeof attachVoteEvents === "function") {
    attachVoteEvents();
  }
});