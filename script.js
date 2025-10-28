// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
let firebaseReady = false;
try {
  firebase.initializeApp(firebaseConfig);
  firebaseReady = true;
} catch (e) {
  console.warn("Firebase not initialized. Using local mock mode.");
}

const statusPill = document.getElementById("statusPill");
const meta = document.getElementById("meta");
const babyToggle = document.getElementById("babyToggle");

let isDry = true;

function setUI(state) {
  const tsText = new Date().toLocaleString();
  meta.textContent = "Last updated: " + tsText;

  if (state === "Wet") {
    statusPill.textContent = "Wet — Change Diaper!";
    statusPill.className = "status-pill status-wet";
  } else {
    statusPill.textContent = "Dry";
    statusPill.className = "status-pill status-dry";
  }
}

// Click on baby image toggles Wet/Dry
babyToggle.addEventListener("click", async () => {
  isDry = !isDry;
  const newState = isDry ? "Dry" : "Wet";
  setUI(newState);

  if (firebaseReady) {
    try {
      const db = firebase.database();
      await db.ref("/diaperStatus").set({ state: newState, ts: Date.now() });
      await db.ref("/history").push({ state: newState, ts: Date.now() });
    } catch (err) {
      console.error("Firebase write failed:", err);
    }
  }
});

// Firebase listener
if (firebaseReady) {
  const db = firebase.database();
  const statusRef = db.ref("/diaperStatus");

  statusRef.on("value", (snapshot) => {
    const val = snapshot.val();
    const state = val?.state || val || "Dry";
    setUI(state);
  });
}

// Initialize UI
setUI("Dry");
