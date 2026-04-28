// register.js
import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("registerForm");
const message = document.getElementById("message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous messages
    message.innerText = "";

    const name = document.getElementById("name").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const county = document.getElementById("county").value;

    // Validation
    if (!name || !idNumber || !age || !email || !password || !county) {
      message.innerText = "All fields are required.";
      return;
    }

    if (!/^\d{8}$/.test(idNumber)) {
      message.innerText = "ID must be exactly 8 digits.";
      return;
    }

    if (age < 18) {
      message.innerText = "You must be 18+ to register.";
      return;
    }

    try {
      // Check duplicate ID
      const q = query(collection(db, "users"), where("idNumber", "==", idNumber));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        message.innerText = "This ID is already registered.";
        return;
      }

      // Disable button to prevent double submission
      form.querySelector("button").disabled = true;

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Save to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        idNumber,
        email,
        county,
        age,
        hasVoted: false,
        role: "user",
        createdAt: new Date()
      });

      message.innerText = "Registration successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (error) {
      // Re-enable button if error occurs
      form.querySelector("button").disabled = false;

      switch (error.code) {
        case "auth/email-already-in-use":
          message.innerText = "Email already registered.";
          break;
        case "auth/invalid-email":
          message.innerText = "Invalid email address.";
          break;
        case "auth/weak-password":
          message.innerText = "Password must be at least 6 characters.";
          break;
        default:
          message.innerText = error.message;
      }
    }
  });
}