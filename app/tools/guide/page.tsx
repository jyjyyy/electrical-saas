"use client";

import { useState } from "react";
import styles from "@/styles/guide.module.css";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const standards = [
  {
    title: "Disjoncteurs courbe B",
    content: "Déclenche rapidement entre 3 et 5 fois l’intensité nominale (In). Utilisé pour les circuits avec peu de risques de surtension (ex : éclairage).",
    simplified: "Ce type de disjoncteur est fait pour couper très vite en cas de problème. Parfait pour les lumières ou les petits appareils.",
  },
  {
    title: "Disjoncteurs courbe C",
    content: "Déclenche entre 5 et 10 × In. Utilisé pour les circuits avec un courant d’appel modéré (ex : prises, chauffage).",
    simplified: "Il est utilisé pour les appareils du quotidien comme les prises ou les chauffages, qui consomment un peu plus au démarrage.",
  },
  {
    title: "Disjoncteurs courbe D",
    content: "Déclenche entre 10 et 14 × In. Pour les charges à fort courant d’appel comme les moteurs ou les machines. Très rarement utilisé dans le résidentiel.",
    simplified: "Pour les gros équipements comme des machines ou moteurs industriels. Pas utile pour une maison.",
  },
  {
    title: "Norme NF C 15-100",
    content: "Norme de référence pour toutes les installations électriques en France. Définit les règles de sécurité, dimensionnement des circuits, emplacement des prises, etc.",
    simplified: "C’est la norme principale pour l’électricité en France. Elle dit où mettre les prises, combien en mettre, comment faire les branchements en sécurité.",
  },
  {
    title: "Hauteur des prises et interrupteurs",
    content: "Les prises doivent être à au moins 5 cm du sol fini. Les interrupteurs entre 0,90 m et 1,30 m du sol.",
    simplified: "Les prises doivent être au minimum à 5 cm du sol, et les interrupteurs entre 90 cm et 1,30 m de haut.",
  },
  {
    title: "Nombre de prises par pièce",
    content: "Salon : minimum 5 prises. Cuisine : au moins 6 prises dont 4 au-dessus du plan de travail. Chambre : minimum 3 prises.",
    simplified: "Salon : 5 prises. Cuisine : 6 prises (4 au-dessus du plan). Chambre : 3 prises minimum.",
  },
  {
    title: "Section des câbles",
    content: "Éclairage : 1.5 mm² (max 16A), Prises : 2.5 mm² (max 20A), Cuisson : 6 mm² (max 32A).",
    simplified: "Lumières : fil de 1,5 mm². Prises : fil de 2,5 mm². Plaque de cuisson : fil de 6 mm².",
  },
  {
    title: "Nombre de circuits max par disjoncteur différentiel",
    content: "Un disjoncteur différentiel de 30 mA peut protéger jusqu’à 8 circuits. Il doit être de type A ou AC selon les usages.",
    simplified: "Un disjoncteur différentiel peut gérer 8 circuits. Il existe plusieurs types selon les appareils (type A ou AC).",
  },
  {
    title: "Obligation du 30 mA",
    content: "Tous les circuits doivent être protégés par un disjoncteur différentiel 30 mA pour éviter les risques d’électrocution.",
    simplified: "Tous les circuits de la maison doivent avoir un disjoncteur différentiel pour protéger les personnes contre les chocs électriques.",
  },
];

export default function StandardsGuide() {
  const [search, setSearch] = useState("");

  const filtered = standards.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase()) ||
    s.simplified.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* ⬅️ Retour au dashboard */}
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

      <h1 className={styles.title}>📘 Guide Normatif Électrique</h1>
      <p className={styles.subtitle}>Trouvez les normes essentielles et compréhensibles pour vos travaux</p>

      <div className={styles.searchBarWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher une norme (ex: disjoncteur, prise...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBar}
        />
      </div>

      <h2 className={styles.sectionTitle}>🔎 Normes les plus recherchées</h2>

      <div className={styles.grid}>
        {filtered.map((item, index) => (
          <div key={index} className={styles.card}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardContent}>{item.simplified}</p>
            <details className={styles.cardDetails}>
              <summary>Voir les détails</summary>
              <p>{item.content}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}