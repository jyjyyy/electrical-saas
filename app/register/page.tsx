"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./register.module.css";
import { FirebaseError } from "firebase/app"; // ✅ Ajout

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ Utilisateur créé :", user.uid);

      const trialEnds = Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours
      );

      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          isPremium: false,
          trialEndsAt: trialEnds,
          createdAt: serverTimestamp(),
        });

        console.log("✅ Données Firestore enregistrées");
        setMessage("Compte créé avec succès !");
        router.push("/dashboard");
      } catch {
        console.error("❌ Erreur Firestore, suppression du compte...");
        await user.delete(); // ⛔ Empêche les comptes orphelins
        setError("Une erreur est survenue pendant la création du compte.");
      }
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.error("❌ Erreur :", firebaseError.message);

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Cette adresse email est déjà utilisée.");
          break;
        case "auth/invalid-email":
          setError("Adresse email invalide.");
          break;
        case "auth/weak-password":
          setError("Le mot de passe est trop faible (6 caractères minimum).");
          break;
        case "auth/operation-not-allowed":
          setError("La création de compte est désactivée.");
          break;
        default:
          setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>Créer un compte</h2>
        <p className={styles.registerSubtitle}>Rejoignez ElectriCalc gratuitement</p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {message && <div className={styles.successMessage}>{message}</div>}

        <form onSubmit={handleRegister} className={styles.registerForm}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={styles.inputField}
            required
          />
          <button type="submit" className={styles.registerButton}>
            Créer le compte
          </button>
        </form>

        <button
          onClick={() => router.push("/login")}
          className={styles.backToLogin}
        >
          ← Déjà inscrit ? Se connecter
        </button>
      </div>
    </div>
  );
}