'use client';

import Link from "next/link";
import styles from "./settings.module.css";
import { FaArrowLeft, FaUser, FaCrown, FaLock, FaCommentDots } from "react-icons/fa";

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <FaArrowLeft /> Retour au Dashboard
      </Link>

      <h1 className={styles.title}>Paramètres</h1>

      <p className={styles.testNotice}>
        🚧 Ce site est actuellement en phase de test. N’hésitez pas à proposer des idées ou signaler un problème dans la section Communication ci-dessous.
      </p>

      <div className={styles.grid}>
        <Link href="/settings/account" className={styles.card}>
          <FaUser className={styles.icon} />
          <h2>Compte</h2>
          <p>Gérez vos informations personnelles</p>
        </Link>

        <Link href="/settings/subscription" className={styles.card}>
          <FaCrown className={styles.icon} />
          <h2>Abonnement</h2>
          <p>Voir ou modifier votre abonnement</p>
        </Link>

        <Link href="/settings/security" className={styles.card}>
          <FaLock className={styles.icon} />
          <h2>Sécurité</h2>
          <p>Changer de mot de passe, déconnexion</p>
        </Link>

        <Link href="/settings/communication" className={styles.card}>
          <FaCommentDots className={styles.icon} />
          <h2>Communication</h2>
          <p>Signaler un problème ou suggérer une amélioration</p>
        </Link>
      </div>
    </div>
  );
}