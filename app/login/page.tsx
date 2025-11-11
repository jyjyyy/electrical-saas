"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./login.module.css";
import { FirebaseError } from "firebase/app"; // ✅ Ajout pour typer les erreurs

export default function LoginPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      setError("Email ou mot de passe incorrect.");
      console.error(firebaseError.message); // optionnel : log plus détaillé
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("Entrez votre adresse email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email de réinitialisation envoyé !");
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      setError("Erreur lors de l’envoi de l’email.");
      console.error(firebaseError.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Connexion</h2>
        <p className={styles.loginSubtitle}>Accédez à votre compte ElectriCalc</p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {message && <div className={styles.successMessage}>{message}</div>}

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
          <button type="submit" className={styles.loginButton}>
            Se connecter
          </button>
        </form>

        <button onClick={handlePasswordReset} className={styles.forgotPassword}>
          Mot de passe oublié ?
        </button>
      </div>
    </div>
  );
}