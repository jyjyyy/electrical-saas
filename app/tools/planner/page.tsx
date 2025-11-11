"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "@/styles/planner.module.css";

export default function Planner() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [result, setResult] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [plannerUses, setPlannerUses] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const equipmentOptions = [
    { name: "Prises", circuitType: "prise" },
    { name: "Lumières", circuitType: "luminaire" },
    { name: "Plaque de cuisson", circuitType: "cuisson" },
    { name: "Chauffage", circuitType: "chauffage" },
    { name: "Lave-linge", circuitType: "lave-linge" },
    { name: "Lave-vaisselle", circuitType: "lave-vaisselle" },
    { name: "Sèche-linge", circuitType: "seche-linge" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setIsPremium(data.isPremium || false);
        setPlannerUses(data.plannerUses || 0);
        if (!data.isPremium && (data.plannerUses || 0) >= 3) {
          setLimitReached(true);
        }
      } else {
        await setDoc(ref, { isPremium: false, plannerUses: 0 });
      }
    };
    fetchUserData();
  }, [user]);

  const handleCheckboxChange = (equipment: string) => {
    if (selectedEquipments.includes(equipment)) {
      setSelectedEquipments(selectedEquipments.filter((e) => e !== equipment));
      const updatedQuantities = { ...quantities };
      delete updatedQuantities[equipment];
      setQuantities(updatedQuantities);
    } else {
      setSelectedEquipments([...selectedEquipments, equipment]);
    }
  };

  const handleQuantityChange = (equipment: string, value: number) => {
    setQuantities({ ...quantities, [equipment]: value });
  };

  const calculateCircuits = async () => {
    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }

    const ref = doc(db, "users", user.uid);

    // ✅ Remplacé let → const pour corriger l'erreur ESLint
    const currentUses = plannerUses;
    const premiumStatus = isPremium;

    if (!premiumStatus && currentUses >= 3) {
      setLimitReached(true);
      return;
    }

    const results: string[] = [];

    selectedEquipments.forEach((equip) => {
      const quantity = quantities[equip] || 0;
      switch (equip) {
        case "Prises":
          results.push(`🧩 ${quantity} prises → ${Math.ceil(quantity / 8)} circuit(s) en 2.5 mm² protégé(s) par disjoncteur 20A.`);
          break;
        case "Lumières":
          results.push(`💡 ${quantity} points lumineux → ${Math.ceil(quantity / 8)} circuit(s) en 1.5 mm² protégé(s) par disjoncteur 16A.`);
          break;
        case "Plaque de cuisson":
          results.push(`🔥 Plaque de cuisson → 1 circuit dédié en 6 mm² protégé par disjoncteur 32A.`);
          break;
        case "Chauffage":
          results.push(`🌡️ ${quantity} chauffage(s) → ${quantity} circuit(s) en 2.5 mm² protégé(s) par disjoncteur 20A.`);
          break;
        case "Lave-linge":
          results.push(`🧺 Lave-linge → 1 circuit dédié en 2.5 mm² protégé par disjoncteur 20A.`);
          break;
        case "Lave-vaisselle":
          results.push(`🍽️ Lave-vaisselle → 1 circuit dédié en 2.5 mm² protégé par disjoncteur 20A.`);
          break;
        case "Sèche-linge":
          results.push(`🌀 Sèche-linge → 1 circuit dédié en 2.5 mm² protégé par disjoncteur 20A.`);
          break;
      }
    });

    setResult(results.join("\n"));

    if (!premiumStatus) {
      const newCount = currentUses + 1;
      await updateDoc(ref, { plannerUses: newCount });
      setPlannerUses(newCount);
      if (newCount >= 3) setLimitReached(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            textDecoration: "none",
            color: "#3b82f6",
            fontWeight: 500,
          }}
        >
          <FaArrowLeft />
          Retour au Dashboard
        </Link>

        <h1 className={styles.title}>Planification des Circuits</h1>
        <p className={styles.subtitle}>Sélectionnez les équipements présents dans le logement</p>

        {!limitReached ? (
          <>
            <div className={styles.checkboxGroup}>
              {equipmentOptions.map((option) => (
                <label key={option.name} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selectedEquipments.includes(option.name)}
                    onChange={() => handleCheckboxChange(option.name)}
                  />
                  {option.name}
                </label>
              ))}
            </div>

            {selectedEquipments.map((equip) => (
              <div key={equip} className={styles.inputGroup}>
                <label className={styles.label}>Nombre de {equip.toLowerCase()} :</label>
                <input
                  type="number"
                  className={styles.inputNumber}
                  value={quantities[equip] || ""}
                  onChange={(e) => handleQuantityChange(equip, parseInt(e.target.value))}
                  min={1}
                />
              </div>
            ))}

            <button className={styles.button} onClick={calculateCircuits}>
              Générer les propositions ({Math.max(3 - plannerUses, 0)}/3 restantes)
            </button>
          </>
        ) : (
          <div className={styles.limitMessage}>
            ⚠️ Vous avez atteint la limite des 3 propositions gratuites.
            <br />
            <button onClick={() => router.push("/settings")} className={styles.premiumButton}>
              Voir les abonnements
            </button>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            {result.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}