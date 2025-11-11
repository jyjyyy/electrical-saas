"use client";

import { generatePanel, Circuit, IDiff } from "@/lib/generatePanel";
import { useEffect, useState } from "react";
import styles from "@/styles/tableau.module.css";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function TableauPage() {
  const [panel, setPanel] = useState<Circuit[]>([]);
  const [diffs, setDiffs] = useState<IDiff[]>([]);
  const [rows, setRows] = useState(1);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("rooms");
    if (stored) {
      try {
        const parsedRooms = JSON.parse(stored);
        const { circuits, differentials, rowCount, notes } = generatePanel(parsedRooms);
        setPanel(circuits);
        setDiffs(differentials);
        setRows(rowCount);
        setNotes(notes || []);
      } catch (e) {
        console.error("Erreur lors de l'analyse ou génération du tableau :", e);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <FaArrowLeft /> Retour au Dashboard
      </Link>

      <h1 className={styles.title}>🔌 Tableau Électrique Généré</h1>

      {panel.length === 0 ? (
        <p className={styles.subtitle}>
          Aucun équipement trouvé. Retournez en arrière et ajoutez des pièces.
        </p>
      ) : (
        <>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Pièce</span>
              <span>Équipement</span>
              <span>Disjoncteur</span>
              <span>Section câble</span>
              <span>Différentiel</span>
            </div>

            {panel.map((circuit, i) => (
              <div className={styles.tableRow} key={i}>
                <span>{circuit.room}</span>
                <span>{circuit.name}</span>
                <span>{circuit.disjoncteur}</span>
                <span>{circuit.cable}</span>
                <span>{circuit.diff || "-"}</span>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>📋 Résumé</h2>
            <p>
              Nombre total de circuits : <strong>{panel.length}</strong>
            </p>
            <p>
              Nombre de rangées nécessaires : <strong>{rows}</strong>
            </p>

            <h3 style={{ marginTop: "1rem" }}>🔐 Interrupteurs différentiels :</h3>
            {diffs.length === 0 ? (
              <p>Aucun différentiel généré.</p>
            ) : (
              diffs.map((diff, index) => (
                <div key={index} style={{ marginBottom: "1.5rem" }}>
                  <h4>Rangée {index + 1}</h4>
                  <p>
                    <strong>Type :</strong> {diff.idType} —{" "}
                    <strong>Calibre :</strong> {diff.amperage}A
                  </p>
                  <p><strong>Circuits associés :</strong></p>
                  <ul>
                    {diff.circuits.map((circuit, i) => (
                      <li key={i}>
                        {circuit.room} — {circuit.name} ({circuit.disjoncteur}, {circuit.cable})
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}

            {notes.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3>🛠️ Remarques importantes</h3>
                <ul>
                  {notes.map((note, index) => (
                    <li key={index} style={{ color: "#d97706", marginBottom: "0.5rem" }}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}