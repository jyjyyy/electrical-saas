'use client';

import { useState, useEffect } from 'react';
import styles from './communication.module.css';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CommunicationPage() {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userEmail = auth.currentUser?.email;

    if (!message.trim() || !userEmail) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        email: userEmail,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setMessage('');
      setSuccess(true);
    } catch (error) {
      console.error('Erreur envoi message :', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Masquer le message de succès après 5 secondes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className={styles.container}>
      <Link href="/settings" className={styles.backLink}>
        <FaArrowLeft /> Retour aux paramètres
      </Link>

      <h1 className={styles.title}>💬 Communication</h1>
      <p className={styles.subtitle}>
        Le site est actuellement en <strong>phase de test</strong>. Si vous avez une idée, une amélioration ou un bug à signaler, envoyez-nous un message ci-dessous :
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="message" className={styles.label}>Votre message :</label>
        <textarea
          id="message"
          className={styles.textarea}
          placeholder="Décrivez votre idée, amélioration ou problème rencontré..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Envoi...' : <>Envoyer <FaPaperPlane /></>}
        </button>
      </form>

      {success && (
        <p className={styles.success}>
          ✅ Merci pour votre contribution ! Votre message a bien été transmis.
        </p>
      )}
    </div>
  );
}