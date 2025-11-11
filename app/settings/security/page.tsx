"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import styles from "./security.module.css";
import { FaArrowLeft, FaSignOutAlt, FaKey } from "react-icons/fa";

export default function SecurityPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.push("/settings")}>
        <FaArrowLeft /> Retour aux paramètres
      </button>

      <h1 className={styles.title}>🔐 Sécurité</h1>

      <div className={styles.card}>
        <h2>Changer le mot de passe</h2>
        <p>Fonctionnalité à venir pour réinitialiser votre mot de passe.</p>
        <button className={styles.changePassword}>
          <FaKey /> Modifier mon mot de passe
        </button>
      </div>

      <div className={styles.card}>
        <h2>Déconnexion</h2>
        <button onClick={handleLogout} className={styles.logout}>
          <FaSignOutAlt /> Se déconnecter
        </button>
      </div>
    </div>
  );
}