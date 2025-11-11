// lib/usePremiumStatus.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseClient";

export function usePremiumStatus(email: string | null | undefined) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (!email) {
      setIsPremium(false);
      return;
    }

    const ref = doc(db, "users", email);
    const unsub = onSnapshot(ref, (snap) => {
      setIsPremium(snap.exists() ? !!snap.data()?.premium : false);
    });

    return () => unsub();
  }, [email]);

  return isPremium; // null (chargement), true, false
}