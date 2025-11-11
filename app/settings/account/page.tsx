"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./account.module.css";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function AccountSettings() {
  const [user] = useAuthState(auth);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setIsPremium(data.isPremium);

        if (data.trialStart) {
          const start = new Date(data.trialStart.toDate());
          const now = new Date();
          const daysLeft = 7 - Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(daysLeft > 0 ? daysLeft : null);
        }
      }
    };

    fetchStatus();
  }, [user]);

  return (
    <div className={styles.container}>
      <Link href="/settings" className={styles.backLink}>
        <FaArrowLeft /> Retour aux Paramètres
      </Link>

      <h1 className={styles.title}>Compte</h1>

      {user ? (
        <div className={styles.infoCard}>
          <p><strong>Email :</strong> {user.email}</p>
          <p>
            <strong>Abonnement :</strong>{" "}
            {isPremium ? (
              <span className={styles.premium}>Premium ✅</span>
            ) : trialDaysLeft ? (
              <span className={styles.trial}>Essai gratuit – {trialDaysLeft} jour(s) restant(s)</span>
            ) : (
              <span className={styles.free}>Gratuit </span>
            )}
          </p>
        </div>
      ) : (
        <p className={styles.infoCard}>Aucun utilisateur connecté.</p>
      )}
    </div>
  );
}