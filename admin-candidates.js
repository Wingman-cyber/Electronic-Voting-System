import { db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const colRef = collection(db, "candidates");

// ================= ADD =================
window.addCandidate = async function () {
  const name = document.getElementById("name").value.trim();
  const party = document.getElementById("party").value.trim();
  const position = document.getElementById("position").value;
  const county = document.getElementById("county").value.trim();

  if (!name || !party || !position || !county) {
    return alert("Fill all fields");
  }

  await addDoc(colRef, {
    name,
    party,
    position,
    county,
    createdAt: new Date()
  });

  alert("Candidate added");

  // clear form
  document.getElementById("name").value = "";
  document.getElementById("party").value = "";
  document.getElementById("position").value = "";
  document.getElementById("county").value = "";
};

// ================= REALTIME LIST =================
onSnapshot(colRef, (snapshot) => {
  const list = document.getElementById("candidateList");
  list.innerHTML = "";

  if (snapshot.empty) {
    list.innerHTML = "<p>No candidates found</p>";
    return;
  }

  // 🔥 Group candidates by position
  const grouped = {};

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();
    const id = docSnap.id;

    if (!grouped[c.position]) {
      grouped[c.position] = [];
    }

    grouped[c.position].push({ ...c, id });
  });

  // 🔥 Render grouped candidates
  Object.keys(grouped).forEach((position) => {
    const section = document.createElement("div");
    section.className = "position-group";

    section.innerHTML = `<h3>${position.toUpperCase()}</h3>`;

    grouped[position].forEach((c) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <b>${c.name}</b><br>
        Party: ${c.party}<br>
        County: ${c.county}<br>

        <button class="deleteBtn" data-id="${c.id}">
          Delete
        </button>
      `;

      section.appendChild(card);
    });

    list.appendChild(section);
  });

  // 🔥 Attach delete events safely
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (confirm("Delete this candidate?")) {
        await deleteDoc(doc(db, "candidates", id));
      }
    });
  });
});

// ================= DELETE (fallback) =================
window.deleteCandidate = async function (id) {
  await deleteDoc(doc(db, "candidates", id));
};