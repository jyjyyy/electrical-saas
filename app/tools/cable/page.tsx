"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '@/styles/cable.module.css';

export default function CableCalculator() {
  const [length, setLength] = useState<number>(0);
  const [power, setPower] = useState<number>(0);
  const [voltage, setVoltage] = useState<number>(230);
  const [material, setMaterial] = useState<'cuivre' | 'aluminium'>('cuivre');
  const [tension, setTension] = useState<number>(5);
  const [result, setResult] = useState<string>('');

  const getNormalizedSection = (section: number): number => {
    const normalized = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    return normalized.find(s => s >= section) || section;
  };

  const resistivity = material === 'cuivre' ? 0.017 : 0.028;

  const calculateSection = () => {
    if (length <= 0 || power <= 0 || voltage <= 0 || tension <= 0) {
      setResult("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }

    const current = power / voltage;
    const deltaU = voltage * (tension / 100);
    const sectionRaw = (2 * resistivity * length * current) / deltaU;
    const sectionRounded = sectionRaw.toFixed(2);
    const sectionRecommended = getNormalizedSection(sectionRaw);

    setResult(
      `Section calculée : ${sectionRounded} mm²\nSection recommandée : ${sectionRecommended} mm²`
    );
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

        <h1 className={styles.title}>Calculs de sections de câbles</h1>

        <div className={styles.formGroup}>
          <div className={styles.inputGroup}>
            <label>Longueur du câble (m)</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Puissance (W)</label>
            <input
              type="number"
              value={power}
              onChange={(e) => setPower(parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Tension (V)</label>
            <input
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Matériau du câble</label>
            <select
              value={material}
              onChange={(e) =>
                setMaterial(e.target.value as 'cuivre' | 'aluminium')
              }
            >
              <option value="cuivre">Cuivre</option>
              <option value="aluminium">Aluminium</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Chute de tension admissible (%)</label>
            <input
              type="number"
              value={tension}
              onChange={(e) => setTension(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <button className={styles.button} onClick={calculateSection}>
          Calculer
        </button>

        {result && <div className={styles.result}>{result}</div>}
      </div>
    </div>
  );
}