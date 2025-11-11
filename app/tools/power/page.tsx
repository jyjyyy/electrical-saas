"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '@/styles/power.module.css';

export default function PowerConverter() {
  const [watts, setWatts] = useState('');
  const [volts, setVolts] = useState('');
  const [amps, setAmps] = useState('');

  const convert = () => {
    const w = parseFloat(watts);
    const v = parseFloat(volts);
    const a = parseFloat(amps);

    if (!w && v && a) setWatts((v * a).toString());
    else if (w && !v && a) setVolts((w / a).toString());
    else if (w && v && !a) setAmps((w / v).toString());
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Bouton retour */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            textDecoration: 'none',
            color: '#3b82f6',
            fontWeight: 500,
          }}
        >
          <FaArrowLeft />
          Retour au Dashboard
        </Link>

        <h1 className={styles.title}>Convertisseur de puissance</h1>
        <p className={styles.subtitle}>Remplis deux champs pour calculer le troisième</p>

        <div className={styles.formGroup}>
          <label>Puissance (Watts)</label>
          <input
            type="number"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
            placeholder="Ex : 1000"
          />

          <label>Tension (Volts)</label>
          <input
            type="number"
            value={volts}
            onChange={(e) => setVolts(e.target.value)}
            placeholder="Ex : 230"
          />

          <label>Courant (Ampères)</label>
          <input
            type="number"
            value={amps}
            onChange={(e) => setAmps(e.target.value)}
            placeholder="Ex : 4.35"
          />

          <button className={styles.button} onClick={convert}>Calculer</button>
        </div>
      </div>
    </div>
  );
}