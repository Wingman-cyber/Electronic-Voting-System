// firebase-init.js
// Make sure you replace the config object with YOUR Firebase project settings

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDloLlNKs9m4Pf5LgyTeLWwtfKox5qdguU",
  authDomain: "electronic-voting-system-ed4f8.firebaseapp.com",
  projectId: "electronic-voting-system-ed4f8",
  storageBucket: "electronic-voting-system-ed4f8.firebasestorage.app",
  messagingSenderId: "205929834403",
  appId: "1:205929834403:web:dbcbbdc0044c32b9701c16",
  measurementId: "G-XZVFHPXY3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export modules for other JS files
export { auth, db };