// pages/dashboard.tsx
'use client';

import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';
import {
  FaTools,
  FaBolt,
  FaSolarPanel,
  FaFileInvoice,
  FaPowerOff,
  FaCog,
  FaBookOpen,
  FaClipboardList, // ✅ Icône pour Générateur tableau
} from 'react-icons/fa';

export default function Dashboard() {
  const tools = [
    {
      title: 'Calcul de Câble',
      subtitle: 'Section de câble, chute de tension, protection...',
      icon: <FaBolt size={28} />,
      link: '/tools/cable',
      color: '#3b82f6',
    },
    {
      title: 'Convertisseur de Puissance',
      subtitle: 'kW ⇄ kVA ⇄ HP avec cos φ',
      icon: <FaPowerOff size={28} />,
      link: '/tools/power',
      color: '#10b981',
    },
    {
      title: 'Photovoltaïque',
      subtitle: 'Calcul rentabilité et production solaire',
      icon: <FaSolarPanel size={28} />,
      link: '/tools/solar',
      color: '#f59e0b',
    },
    {
      title: 'Générateur de Devis',
      subtitle: 'Créer et exporter vos devis PDF professionnels',
      icon: <FaFileInvoice size={28} />,
      link: '/tools/quote',
      color: '#8b5cf6',
    },
    {
      title: 'Planification électrique',
      subtitle: 'Estimation des circuits et protections à prévoir',
      icon: <FaTools size={28} />,
      link: '/tools/planner',
      color: '#ec4899',
    },
    {
      title: 'Générateur de tableau sur mesure',
      subtitle: 'Créez un tableau électrique complet selon vos besoins',
      icon: <FaClipboardList size={28} />,
      link: '/tools/custom-panel',
      color: '#0ea5e9', // bleu clair
    },
    {
      title: 'Guide Normatif',
      subtitle: 'Normes électriques simplifiées et expliquées',
      icon: <FaBookOpen size={28} />,
      link: '/tools/guide',
      color: '#f43f5e',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Tableau de bord</h1>
        <Link href="/settings" className={styles.settingsBtn}>
          <FaCog size={20} />
          <span>Paramètres</span>
        </Link>
      </div>

      <div className={styles.grid}>
        {tools.map((tool, index) => (
          <Link
            href={tool.link}
            key={index}
            className={styles.card}
            style={{ borderColor: tool.color }}
          >
            <div className={styles.icon} style={{ color: tool.color }}>
              {tool.icon}
            </div>
            <h2>{tool.title}</h2>
            <p className={styles.subtitle}>{tool.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}