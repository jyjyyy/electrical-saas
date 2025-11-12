"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./subscription.module.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function SubscriptionPage() {
  const [user] = useAuthState(auth);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      console.log("Stripe Checkout response:", data); // 🐛 DEBUG

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Erreur : aucune URL de redirection reçue :", data);
        alert("Impossible de rediriger vers Stripe. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur API checkout:", error);
      alert("Une erreur est survenue lors de la tentative d’abonnement.");
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/settings" className={styles.backLink}>
        <FaArrowLeft /> Retour aux paramètres
      </Link>

      <h1 className={styles.title}>💎 Abonnement Premium</h1>

      <div className={styles.infoBox}>
        {user && (
          <p>
            Connecté en tant que : <strong>{user.email}</strong>
          </p>
        )}
        <p>
          Activez l’abonnement pour débloquer toutes les fonctionnalités :
          export illimité, logo sur les devis, tableau électrique complet...
        </p>
      </div>

      <div className={styles.planCard}>
        <h2>Formules disponibles</h2>
        <button onClick={() => handleSubscribe("monthly")}>
          🔄 Mensuel – 4,99 €/mois (7 jours d’essai)
        </button>
        <button onClick={() => handleSubscribe("yearly")}>
          📅 Annuel – 39,99 €/an (7 jours d’essai)
        </button>
      </div>
    </div>
  );
}