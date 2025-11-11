// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚡️ Ton config Firebase (celui que tu avais dans firebaseconfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyA_OlW4zVhQfkiLYlURb2q2mQhBaO7f9pw",
  authDomain: "electricalc-fr-1df5e.firebaseapp.com",
  projectId: "electricalc-fr-1df5e",
  storageBucket: "electricalc-fr-1df5e.firebasestorage.app",
  messagingSenderId: "544763977677",
  appId: "1:544763977677:web:712312b73c9a01c010ee84",
  measurementId: "G-QRENKSLJTT"
};

// ✅ Empêche plusieurs initialisations (Next.js recharge les modules souvent)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);