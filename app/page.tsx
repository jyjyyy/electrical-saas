'use client';

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import styles from './home.module.css';

export default function HomePage() {
  const [user] = useAuthState(auth);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>⚡ ElectriCalc FR</h1>
      <p className={styles.subtitle}>
        Le SaaS intelligent pour tous vos calculs électriques : sections de câbles, devis, tableaux, photovoltaïque...
      </p>

      <div className={styles.buttons}>
        {user ? (
          <Link href="/dashboard" className={styles.btnPrimary}>
            Accéder au tableau de bord
          </Link>
        ) : (
          <>
            <Link href="/register" className={styles.btnPrimary}>
              Créer un compte
            </Link>
            <Link href="/login" className={styles.btnSecondary}>
              Déjà inscrit ? Se connecter
            </Link>
          </>
        )}
      </div>
    </main>
  );
}