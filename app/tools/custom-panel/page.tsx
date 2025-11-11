"use client";

import { useRouter } from 'next/navigation';
import { useState } from "react";
import styles from "@/styles/panelBuilder.module.css";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import Link from "next/link";

const roomTypes = [
  "Chambre", "Cuisine", "Salle de bain", "Salon", "Garage", "Buanderie", "Toilettes", "Bureau", "Couloir", "Autre"
];

const equipmentOptions = [
  { name: "Prises électriques", color: "#3b82f6" },
  { name: "Éclairages", color: "#10b981" },
  { name: "Ligne Spots encastrés", color: "#06b6d4" },
  { name: "Plaques de cuisson", color: "#f59e0b" },
  { name: "Lave-linge", color: "#ec4899" },
  { name: "Lave-vaisselle", color: "#8b5cf6" },
  { name: "Réfrigérateur", color: "#ef4444" },
  { name: "Chauffe-eau", color: "#14b8a6" },
  { name: "Volets roulants", color: "#0ea5e9" },
  { name: "Congélateur", color: "#a855f7" },
  { name: "Four électrique", color: "#f97316" },
  { name: "Chauffage électrique", color: "#e11d48" },
];

export default function CustomPanelGenerator() {
  const router = useRouter();
  const [rooms, setRooms] = useState<{ name: string; equipment: { [key: string]: number } }[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getUniqueRoomName = (base: string) => {
    const existing = rooms.filter(r => r.name.startsWith(base));
    if (existing.length === 0) return base;
    return `${base} ${existing.length + 1}`;
  };

  const addRoom = () => {
    if (newRoom.trim()) {
      const finalName = getUniqueRoomName(newRoom.trim());
      const updated = [...rooms, { name: finalName, equipment: {} }];
      setRooms(updated);
      setActiveIndex(updated.length - 1);
      setNewRoom("");
    }
  };

  const removeRoom = (index: number) => {
    const updated = rooms.filter((_, i) => i !== index);
    setRooms(updated);
    if (activeIndex === index) {
      setActiveIndex(null);
    } else if (activeIndex && index < activeIndex) {
      setActiveIndex((prev) => prev! - 1);
    }
  };

  const addEquipment = (roomIndex: number, eqName: string) => {
    setRooms(prevRooms =>
      prevRooms.map((room, idx) => {
        if (idx !== roomIndex) return room;
        const newEquip = { ...room.equipment };
        newEquip[eqName] = (newEquip[eqName] || 0) + 1;
        return { ...room, equipment: newEquip };
      })
    );
  };

  const removeEquipment = (roomIndex: number, eqName: string) => {
    setRooms(prevRooms =>
      prevRooms.map((room, idx) => {
        if (idx !== roomIndex) return room;
        const newEquip = { ...room.equipment };
        if (newEquip[eqName] > 1) {
          newEquip[eqName] = newEquip[eqName] - 1;
        } else {
          delete newEquip[eqName];
        }
        return { ...room, equipment: newEquip };
      })
    );
  };

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <FaArrowLeft /> Retour au Dashboard
      </Link>

      <h1 className={styles.title}>🧩 Générateur de tableau sur mesure</h1>
      <p className={styles.subtitle}>
        Ajoutez les pièces et les équipements pour générer un tableau personnalisé.
      </p>
      <p className={styles.warningText}>
        <strong>Important :</strong> Pour les équipements comme les <strong>prises</strong>, <strong>éclairages</strong> ou <strong>spots encastrés</strong>,
        le nombre que vous indiquez correspond au <strong>nombre de lignes tirées depuis le tableau électrique</strong>
        (et non au nombre de prises ou lampes physiques dans la pièce).
      </p>
      <p className={styles.warningText}>
        Exemple : Si vous avez 5 prises dans un salon mais qu&apos;elles sont toutes reliées à un seul câble depuis le tableau, indiquez simplement <strong>1 ligne</strong>.
        <br />
        💡 Pour rappel : un disjoncteur 20A peut alimenter jusqu&apos;à <strong>12 prises</strong> sur un maximum de <strong>2 circuits</strong> différents.
      </p>

      <p className={styles.notice}>
        <strong>💡 Info :</strong> Le nombre saisi pour les <strong>prises</strong>, <strong>éclairages</strong> ou <strong>spots</strong> correspond au <strong>nombre de lignes tirées depuis le tableau</strong> (pas au nombre d&apos;appareils physiques).
      </p>
      <p className={styles.notice}>
        ➤ <strong>Prises :</strong> jusqu&apos;à <strong>8 prises</strong> max par disjoncteur 20A et <strong>2 circuits différents</strong> max.
        <br />
        ➤ <strong>Volets roulants :</strong> si chaque ligne est reliée directement au disjoncteur, <strong>max 2 lignes</strong>. Si une boîte de dérivation est utilisée, plusieurs volets peuvent être regroupés sur 1 ligne (en respectant la puissance totale).
      </p>     

      <div className={styles.roomAdder}>
        <select
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          className={styles.roomSelect}
        >
          <option value="">Ajouter une pièce...</option>
          {roomTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button className={styles.addRoomBtn} onClick={addRoom}>Ajouter</button>
      </div>

      <div className={styles.roomSelector}>
        {rooms.map((room, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`${styles.roomBadge} ${i === activeIndex ? styles.selected : ""}`}
          >
            {room.name}
            <span
              className={styles.removeRoomX}
              onClick={(e) => {
                e.stopPropagation();
                removeRoom(i);
              }}
            >
              <FaTimes size={12} />
            </span>
          </button>
        ))}
      </div>

      {activeIndex !== null && rooms[activeIndex] && (
        <div className={styles.roomCard}>
          <h2>{rooms[activeIndex].name}</h2>
          <div className={styles.grid}>
            {equipmentOptions.map((eq) => {
              const qty = rooms[activeIndex].equipment[eq.name] || 0;
              return (
                <div
                  key={eq.name}
                  className={styles.card}
                  style={{ borderColor: eq.color }}
                >
                  <h3>{eq.name}</h3>
                  <div className={styles.cardControls}>
                    <button onClick={() => removeEquipment(activeIndex, eq.name)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => addEquipment(activeIndex, eq.name)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rooms.length > 0 && (
        <div className={styles.summary}>
          <h2>📋 Résumé par pièce :</h2>
          <ul>
            {rooms.map((room, i) => (
              <li key={i}>
                <strong>{room.name} :</strong>{" "}
                {Object.entries(room.equipment).map(([eq, qty]) => `${qty} × ${eq}`).join(", ")}
              </li>
            ))}
          </ul>
          <button
            className={styles.validateBtn}
            onClick={() => {
              localStorage.setItem("rooms", JSON.stringify(rooms));
              router.push("/tools/custom-panel/tableau");
            }}
          >
            Générer mon tableau ⚡
          </button>
        </div>
      )}
    </div>
  );
}