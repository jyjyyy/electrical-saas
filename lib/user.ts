// lib/user.ts
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Fonction pour sauvegarder ou mettre à jour un utilisateur
export async function saveUser(
  uid: string,
  email: string,
  isPremium = false,
  subscriptionType: string | null = null
) {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      uid,
      email,
      isPremium,
      subscriptionType,
      subscriptionStart: isPremium ? new Date().toISOString() : null,
    },
    { merge: true } // pour éviter d’écraser les anciennes données
  );
}