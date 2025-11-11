"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import styles from '@/styles/solar.module.css';

const regionSunHours: Record<string, number> = {
  'Île-de-France': 3.5,
  'Auvergne-Rhône-Alpes': 4,
  'Provence-Alpes-Côte d’Azur': 5,
  'Occitanie': 5,
  'Grand Est': 3,
  'Hauts-de-France': 2.8,
  'Normandie': 2.9,
  'Bretagne': 3,
  'Nouvelle-Aquitaine': 4.5,
  'Pays de la Loire': 3.5,
  'Centre-Val de Loire': 3.6,
  'Bourgogne-Franche-Comté': 3.2,
};

export default function SolarCalculator() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [consumption, setConsumption] = useState<number>(0);
  const [panelPower, setPanelPower] = useState<number>(400);
  const [efficiency, setEfficiency] = useState<number>(75);
  const [region, setRegion] = useState<string>('Auvergne-Rhône-Alpes');
  const [targetGain, setTargetGain] = useState<number>(0);
  const [result, setResult] = useState<string>('');

  // Vérifie le statut premium
  useEffect(() => {
    const fetchPremium = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      setIsPremium(snap.exists() ? snap.data().isPremium : false);
    };

    fetchPremium();
  }, [user]);

  const handleToggleMode = () => {
    if (!isPremium) {
      setShowPremiumMessage(true);
      return;
    }
    setIsAdvanced(!isAdvanced);
    setShowPremiumMessage(false);
  };

  const calculate = () => {
    const sunHours = regionSunHours[region] || 4;
    const panelDailyOutput = (panelPower * (efficiency / 100)) * sunHours / 1000; // en kWh
    const monthlyOutputPerPanel = panelDailyOutput * 30;

    if (consumption <= 0 || panelPower <= 0 || efficiency <= 0) {
      setResult("Veuillez remplir tous les champs correctement.");
      return;
    }

    const panelsNeededForOwnUse = Math.ceil(consumption / monthlyOutputPerPanel);
    const reventeKWhCible = targetGain / 0.13;
    const panelsForGain = targetGain > 0 ? Math.ceil(reventeKWhCible / monthlyOutputPerPanel) : 0;
    const totalPanels = panelsNeededForOwnUse + panelsForGain;
    const totalArea = totalPanels * 1.8;
    const totalCost = totalPanels * 300;
    const revenue = (monthlyOutputPerPanel * panelsForGain) * 0.13;

    setResult(
      `🔋 Vous avez besoin d’environ ${totalPanels} panneau(x) de ${panelPower}W\n` +
      `💡 Pour couvrir votre consommation de ${consumption} kWh/mois : ${panelsNeededForOwnUse} panneau(x)\n` +
      (targetGain > 0 ? `💶 Pour générer environ ${targetGain}€/mois en surplus : ${panelsForGain} panneau(x)\n` : '') +
      `🌤 Région : ${region} (≈ ${sunHours} h/jour)\n` +
      `📏 Surface estimée : ${totalArea.toFixed(1)} m²\n` +
      `💰 Coût estimé : ${totalCost.toLocaleString()} €\n` +
      (targetGain > 0 ? `📈 Revente mensuelle estimée : ${revenue.toFixed(2)} €` : '')
    );
  };

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <FaArrowLeft /> Retour au Dashboard
      </Link>

      <h1 className={styles.title}>Calcul photovoltaïque</h1>

      <div className={styles.modeToggle}>
        <button className={styles.toggleButton} onClick={handleToggleMode}>
          {isAdvanced ? 'Mode simplifié' : 'Mode avancé'}
        </button>

        {showPremiumMessage && (
          <div className={styles.premiumWarning}>
            <p>🚫 Le mode avancé est réservé aux abonnés Premium.</p>
            <button
              onClick={() => router.push("/settings")}
              className={styles.premiumButton}
            >
              Voir les abonnements
            </button>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.inputGroup}>
          <label>Consommation mensuelle (kWh)</label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(parseFloat(e.target.value))}
          />
        </div>

        {isAdvanced && (
          <>
            <div className={styles.inputGroup}>
              <label>Région</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                {Object.keys(regionSunHours).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Puissance d’un panneau (W)</label>
              <input
                type="number"
                value={panelPower}
                onChange={(e) => setPanelPower(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Rendement du système (%)</label>
              <input
                type="number"
                value={efficiency}
                onChange={(e) => setEfficiency(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Gain mensuel souhaité (€)</label>
              <input
                type="number"
                value={targetGain}
                onChange={(e) => setTargetGain(parseFloat(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      <button className={styles.button} onClick={calculate}>Calculer</button>

      {result && (
        <div className={styles.result}>
          {result.split('\n').map((line, i) => (<p key={i}>{line}</p>))}
        </div>
      )}
    </div>
  );
}