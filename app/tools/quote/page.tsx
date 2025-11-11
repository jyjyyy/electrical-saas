"use client";

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '@/styles/quote.module.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
const QuoteGenerator = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [quoteUses, setQuoteUses] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [client, setClient] = useState({ name: '', address: '', phone: '', email: '' });
  const [site, setSite] = useState({ name: '', address: '', date: '', type: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, unit: 'pièce', unitPrice: 0 }]);
  const [tva, setTva] = useState(20);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setIsPremium(data.isPremium);
        setQuoteUses(data.quoteUses || 0);
        if (!data.isPremium && (data.quoteUses || 0) >= 2) {
          setLimitReached(true);
        }
      }
    };
    fetchUser();
  }, [user]);

  const handleItemChange = (
  index: number,
  field: keyof typeof items[number],
  value: string | number
) => {
  const newItems = [...items];
  if (field === 'quantity' || field === 'unitPrice') {
    newItems[index][field] = parseFloat(value as string);
  } else {
    newItems[index][field] = value as string;
  }
  setItems(newItems);
};

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit: 'pièce', unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 1.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      alert("Le fichier est trop volumineux (max 1.5 Mo)");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tvaAmount = subtotal * (tva / 100);
  const total = subtotal + tvaAmount;

  const handleDownloadPdf = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour exporter un PDF.");
      return;
    }

    if (!isPremium && quoteUses >= 2) {
      setLimitReached(true);
      return;
    }

    const element = document.getElementById('quote-preview');
    if (!element) return;

    element.classList.remove(styles.noPrint);
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('devis.pdf');

    element.classList.add(styles.noPrint);

    if (!isPremium) {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, { quoteUses: increment(1) }, { merge: true });
      setQuoteUses(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Link href="/dashboard" className={styles.backLink}>
          <FaArrowLeft />
          Retour au Dashboard
        </Link>

        <h1 className={styles.title}>📄 Générateur de Devis</h1>

        <div className={styles.fieldGroup}>
          <input placeholder="Nom de l'entreprise (facultatif)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={styles.input} />
          <input type="file" accept="image/*" onChange={handleLogoUpload} className={styles.input} />
        </div>

        <h2 className={styles.sectionTitle}>🧍 Informations Client</h2>
        <div className={styles.fieldGroup}>
          <input placeholder="Nom" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className={styles.input} />
          <input placeholder="Adresse" value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} className={styles.input} />
          <input placeholder="Téléphone" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className={styles.input} />
          <input placeholder="Email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className={styles.input} />
        </div>

        <h2 className={styles.sectionTitle}>🏠 Informations Chantier</h2>
        <div className={styles.fieldGroup}>
          <input placeholder="Nom du chantier" value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} className={styles.input} />
          <input placeholder="Adresse du chantier" value={site.address} onChange={(e) => setSite({ ...site, address: e.target.value })} className={styles.input} />
          <input type="date" value={site.date} onChange={(e) => setSite({ ...site, date: e.target.value })} className={styles.input} />
          <select value={site.type} onChange={(e) => setSite({ ...site, type: e.target.value })} className={styles.select}>
            <option value="">Type de bâtiment</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison">Maison</option>
            <option value="Local professionnel">Local professionnel</option>
          </select>
        </div>

        <h2 className={styles.sectionTitle}>🛠 Prestations</h2>
        {items.map((item, index) => (
          <div key={index} className={styles.fieldGroup}>
            <textarea placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className={styles.textarea} />
            <input type="number" placeholder="Quantité" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={styles.input} />
            <input placeholder="Unité" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className={styles.input} />
            <input type="number" placeholder="Prix HT" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className={styles.input} />
            <button onClick={() => removeItem(index)} className={styles.deleteButton}>Supprimer</button>
          </div>
        ))}
        <button onClick={addItem} className={styles.addButton}>+ Ajouter une prestation</button>

        <h2 className={styles.sectionTitle}>💰 TVA</h2>
        <div className={styles.fieldGroup}>
          <input type="number" placeholder="TVA (%)" value={tva} onChange={(e) => setTva(parseFloat(e.target.value))} className={styles.input} />
        </div>

        <div className={styles.summary}>
          <p>Sous-total HT : {subtotal.toFixed(2)} €</p>
          <p>TVA ({tva}%) : {tvaAmount.toFixed(2)} €</p>
          <p><strong>Total TTC : {total.toFixed(2)} €</strong></p>
          {!isPremium && <p>📤 Exports PDF restants : <strong>{2 - quoteUses}</strong></p>}
        </div>

        {limitReached && !isPremium && (
          <div className={styles.limitMessage}>
            ⚠️ Vous avez atteint la limite des 2 exports PDF sans abonnement.
            <br />
            <button onClick={() => router.push("/settings")} className={styles.premiumButton}>
              Voir les abonnements
            </button>
          </div>
        )}

        <button onClick={handleDownloadPdf} className={styles.pdfButton}>📄 Télécharger le PDF</button>

        <div id="quote-preview" className={styles.preview}>
          <div className={styles.previewBox}>
            {logoUrl && (
  <Image
    src={logoUrl}
    alt="Logo"
    width={100}
    height={100}
    className={styles.logo}
    unoptimized
  />
)}
            {companyName && <div className={styles.companyName}>{companyName}</div>}

            <p className={styles.previewText}>Client : <strong>{client.name || '-'}</strong></p>
            <p className={styles.previewText}>Adresse : {client.address || '-'}</p>
            <p className={styles.previewText}>Téléphone : {client.phone || '-'}</p>
            <p className={styles.previewText}>Email : {client.email || '-'}</p>

            <p className={styles.previewText}>Chantier : <strong>{site.name || '-'}</strong></p>
            <p className={styles.previewText}>Adresse : {site.address || '-'}</p>
            <p className={styles.previewText}>Date prévue : {site.date || '-'}</p>
            <p className={styles.previewText}>Type : {site.type || '-'}</p>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qté</th>
                  <th>Unité</th>
                  <th>PU HT</th>
                  <th>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.unitPrice.toFixed(2)} €</td>
                    <td>{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.summaryText}>
              <p>Sous-total HT : <strong>{subtotal.toFixed(2)} €</strong></p>
              <p>TVA ({tva}%) : <strong>{tvaAmount.toFixed(2)} €</strong></p>
              <p>Total TTC : <strong>{total.toFixed(2)} €</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteGenerator;