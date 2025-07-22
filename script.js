// 🧩 Firebase Core Modules
import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🔧 Default Firebase Configuration (for app UI and admin tasks)
const firebaseConfig = {
  apiKey: "AIzaSyDkWk9Exlu_3WS42TR6EFMtyv9wdZKs8rs",
  authDomain: "wlbootproject.firebaseapp.com",
  databaseURL: "https://wlbootproject-default-rtdb.firebaseio.com",
  projectId: "wlbootproject",
  storageBucket: "wlbootproject.firebasestorage.app",
  messagingSenderId: "12894253323",
  appId: "1:12894253323:web:653528577d403beca2320e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🎨 Admin-controlled background styling
const adminSettingsRef = ref(db, "adminSettings");
onValue(
  adminSettingsRef,
  (snapshot) => {
    const settings = snapshot.val() || {};
    if (settings.backgroundColor) {
      document.body.style.backgroundColor = settings.backgroundColor;
    }
    if (settings.backgroundImage) {
      document.body.style.backgroundImage = `url(${settings.backgroundImage})`;
      document.body.style.backgroundSize = "cover";
    } else {
      document.body.style.backgroundImage = "none";
    }
    if (settings.startupImage) {
      const cover = document.getElementById("coverPage");
      if (cover) {
        cover.style.backgroundImage = `url(${settings.startupImage})`;
        cover.style.backgroundSize = "cover";
        cover.style.backgroundPosition = "center";
        cover.style.backgroundRepeat = "no-repeat";
      }
    }
  },
  { onlyOnce: true }
);

// ✅ Visibility logic
document.addEventListener("DOMContentLoaded", () => {
  const coverPage = document.getElementById("coverPage");
  const authPanel = document.getElementById("authPanel");
  const signUpForm = document.getElementById("signUpForm");
  const loginForm = document.getElementById("loginForm");
  const startBtn = document.getElementById("startBtn");
  const toLoginLink = document.getElementById("toLogin");

  coverPage.style.display = "block";
  authPanel.style.display = "none";
  signUpForm.style.display = "block";
  loginForm.style.display = "none";

  startBtn?.addEventListener("click", () => {
    coverPage.style.display = "none";
    authPanel.style.display = "flex";
    signUpForm.style.display = "block";
    loginForm.style.display = "none";
  });

  toLoginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    signUpForm.style.display = "none";
    loginForm.style.display = "block";

    if (!document.getElementById("toSignUp")) {
      const p = document.createElement("p");
      p.innerHTML = `Don't have an account yet? <a href="#" id="toSignUp">Sign Up</a>`;
      loginForm.appendChild(p);

      document.getElementById("toSignUp").addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        signUpForm.style.display = "block";
      });
    }
  });
});

// ✅ Sign-Up Handler — auto-switches to creator Firebase or uses default
signUpForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName")?.value.trim();
  const email = document.getElementById("signUpEmail")?.value.trim();
  const password = document.getElementById("signUpPassword")?.value.trim();
  const contact = document.getElementById("contactNumber")?.value.trim();
  const country = document.getElementById("country")?.value.trim();

  try {
    const creatorSnap = await get(ref(db, "metadata/activeCreator/uid"));
    const creatorUid = creatorSnap.val();

    let appToUse = getApp();
    let authToUse = auth;
    let dbToUse = db;

    if (creatorUid) {
      const configSnap = await get(
        ref(db, `settings/${creatorUid}/firebaseConfig`)
      );
      const config = configSnap.val();
      if (config) {
        const appName = `app_${creatorUid}`;
        appToUse =
          getApps().find((a) => a.name === appName) ||
          initializeApp(config, appName);
        authToUse = getAuth(appToUse);
        dbToUse = getDatabase(appToUse);
      }
    }

    const userCredential = await createUserWithEmailAndPassword(
      authToUse,
      email,
      password
    );
    const user = userCredential.user;

    await set(ref(dbToUse, `students/${user.uid}`), {
      fullName,
      email,
      contact,
      country,
      role: "student",
      photoURL: "",
    });

    alert("🎉 Account created! You can now log in.");
    signUpForm.style.display = "none";
    loginForm.style.display = "block";
  } catch (err) {
    alert("❌ Sign-up error: " + err.message);
  }
});

// ✅ Login Handler — supports buyer Firebase + saves config + persists session
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();
  
    try {
      const creatorSnap = await get(ref(db, "metadata/activeCreator/uid"));
      const creatorUid = creatorSnap.val();
  
      let appToUse = getApp(); // default fallback
      let authToUse = auth;
  
      if (creatorUid) {
        const configSnap = await get(
          ref(db, `settings/${creatorUid}/firebaseConfig`)
        );
        const config = configSnap.val();
        if (config) {
          const appName = `app_${creatorUid}`;
          appToUse =
            getApps().find((a) => a.name === appName) ||
            initializeApp(config, appName);
          authToUse = getAuth(appToUse);
  
          // ✅ Save app info for session rehydration on other pages
          sessionStorage.setItem("activeFirebaseAppName", appToUse.name);
          sessionStorage.setItem("activeFirebaseConfig", JSON.stringify(config));
          window.sessionApp = appToUse;
        }
      } else {
        // ✅ Still store default app name for fallback recovery
        sessionStorage.setItem("activeFirebaseAppName", appToUse.name);
        window.sessionApp = appToUse;
      }
  
      // ✅ Ensure login persists across navigation
      await setPersistence(authToUse, browserLocalPersistence);
  
      const userCredential = await signInWithEmailAndPassword(
        authToUse,
        email,
        password
      );
      const user = userCredential.user;
  
      console.log("✅ Login successful:", user.email);
      window.location.href = "home.html";
    } catch (err) {
      document.getElementById("loginError").textContent = "❌ " + err.message;
    }
  });
// 👁️ Show/hide password toggle
document.getElementById("showPassword")?.addEventListener("change", (e) => {
  const pwField = document.getElementById("loginPassword");
  pwField.type = e.target.checked ? "text" : "password";
});
