import { db } from "./firebase-init.js";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usersRef = collection(db, "users");

// 🔥 Define required positions
const requiredPositions = [
  "president",
  "governor",
  "mp",
  "senator",
  "women_rep"
];

onSnapshot(usersRef, async (snapshot) => {
  const list = document.getElementById("voterList");
  list.innerHTML = "";

  for (const userDoc of snapshot.docs) {
    const v = userDoc.data();
    const uid = userDoc.id;

    // 🔎 Get votes for this user
    const voteQuery = query(
      collection(db, "votes"),
      where("userId", "==", uid)
    );

    const voteSnap = await getDocs(voteQuery);

    const votedPositions = new Set();

    voteSnap.forEach(doc => {
      votedPositions.add(doc.data().position);
    });

    // ✅ Check full completion
    const hasCompletedVoting = requiredPositions.every(pos =>
      votedPositions.has(pos)
    );

    // 📊 Progress
    const progress = `${votedPositions.size}/${requiredPositions.length}`;

    list.innerHTML += `
      <div class="card">
        <b>${v.name}</b><br>
        ID: ${v.idNumber}<br>
        Email: ${v.email}<br>
        County: ${v.county}<br>
        Age: ${v.age}<br>
        Status: ${
          hasCompletedVoting
            ? "✅ Completed"
            : `⏳ In Progress (${progress})`
        }
      </div>
    `;
  }
});