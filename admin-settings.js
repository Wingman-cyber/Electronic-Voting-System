// ================= IMPORTS =================
import { db } from "./firebase-init.js";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= REF =================
const settingsRef = doc(db, "settings", "election");

// ================= LOAD CURRENT STATUS =================
async function loadSettings() {
  const snap = await getDoc(settingsRef);

  if (snap.exists()) {
    const data = snap.data();

    document.getElementById("status").innerText =
      data.votingOpen ? "🟢 Voting is OPEN" : "🔴 Voting is CLOSED";
  } else {
    await setDoc(settingsRef, { votingOpen: true });
    document.getElementById("status").innerText = "🟢 Voting is OPEN";
  }
}

// ================= OPEN VOTING =================
window.openVoting = async function () {
  await setDoc(settingsRef, { votingOpen: true }, { merge: true });

  document.getElementById("status").innerText = "🟢 Voting is OPEN";
  alert("Voting opened");
};

// ================= CLOSE VOTING =================
window.closeVoting = async function () {
  await setDoc(settingsRef, { votingOpen: false }, { merge: true });

  document.getElementById("status").innerText = "🔴 Voting is CLOSED";
  alert("Voting closed");
};

// ================= REALTIME LISTENER =================
onSnapshot(settingsRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("status").innerText =
    data.votingOpen ? "🟢 Voting is OPEN" : "🔴 Voting is CLOSED";
});

// ================= INIT =================
loadSettings();