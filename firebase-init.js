// -----------------------------------------------------------------------------
//  firebase-init.js – White-labeled Firebase config for modular deployment
// -----------------------------------------------------------------------------

import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  child,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🧼 Firebase project config (Replace with your own if needed)
const firebaseConfig = {
  apiKey: "AIzaSyDkWk9Exlu_3WS42TR6EFMtyv9wdZKs8rs",
  authDomain: "wlbootproject.firebaseapp.com",
  databaseURL: "https://wlbootproject-default-rtdb.firebaseio.com",
  projectId: "wlbootproject",
  storageBucket: "wlbootproject.firebasestorage.app",
  messagingSenderId: "12894253323",
  appId: "1:12894253323:web:653528577d403beca2320e",
};

// 🔐 Initialize Firebase safely
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 📦 Export Firebase tools globally
export { app, auth, db, ref, get, set, update, remove, child, onValue, push };

window.auth = auth;
window.db = db;
