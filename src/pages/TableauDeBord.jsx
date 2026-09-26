import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { recupererFournisseurs, recupererStats } from '../api/admin.js';
import { useSessionAdmin } from '../hooks/useSessionAdmin.js';
import CarteFournisseurAdmin from '../components/CarteFournisseurAdmin.jsx';
import NavAdmin from '../components/NavAdmin.jsx';

const ONGLETS = [
  { cle: 'en_attente', libelle: 'En attente' },
  { cle: 'publie', libelle: 'Publiés' },
  { cle: 'suspendu', libelle: 'Suspendus' },
];

export default function TableauDeBord() {
  const { session, autorise } = useSessionAdmin();
  const [fournisseurs, setFournisseurs] = useState(undefined);
  const [stats, setStats] = useState(undefined);
  const [onglet, setOnglet] = useState('en_attente');
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(() => {
    recupererFournisseurs().then(setFournisseurs).catch((err) => setErreur(err.message));
    recupererStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (autorise) recharger();
  }, [autorise, recharger]);

  if (session === undefined || autorise === undefined) {
    return <section className="section"><div className="container"><div className="loo-squelette" style={{ height: '200px' }} /></div></section>;
  }
  if (autorise === false) {
    return <section className="section"><div className="container"><p>Ce compte n'a pas les droits d'administration.</p></div></section>;
  }

  const liste = (fournisseurs || []).filter((f) => f.statut === onglet);

  return (
    <section className="section">
      <div className="container">
        <NavAdmin />
        <h1 className="section-titre" style={{ marginTop: 0 }}>Fournisseurs</h1>

        {stats && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.8rem' }}>
            <CarteStat titre="Fournisseurs" valeur={stats.grossistes_total} />
            <CarteStat titre="Publiés" valeur={stats.grossistes_publies} />
            <CarteStat titre="Vérifiés" valeur={stats.grossistes_verifies} />
            <CarteStat titre="En attente" valeur={stats.grossistes_en_attente} />
            <CarteStat titre="Produits" valeur={stats.produits_total} />
            <CarteStat titre="Contacts (7 j)" valeur={stats.contacts_7_jours} />
          </div>
        )}

        {erreur && <p style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
          {ONGLETS.map((o) => (
            <button
              key={o.cle} type="button"
              className={onglet === o.cle ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '0.5em 1.1em', fontSize: '0.85rem' }}
              onClick={() => setOnglet(o.cle)}
            >
              {o.libelle} {fournisseurs && `(${fournisseurs.filter((f) => f.statut === o.cle).length})`}
            </button>
          ))}
        </div>

        {fournisseurs === undefined && <div className="loo-squelette" style={{ height: '160px' }} />}
        {fournisseurs && liste.length === 0 && <p style={{ opacity: 0.7 }}>Aucun fournisseur dans cette catégorie.</p>}

        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {liste.map((f) => <CarteFournisseurAdmin key={f.id} f={f} onChange={recharger} />)}
        </div>
      </div>
    </section>
  );
}

function CarteStat({ titre, valeur }) {
  return (
    <div className="carte" style={{ padding: '0.9rem 1.2rem', minWidth: '110px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--police-etiquette)' }}>{valeur}</div>
      <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{titre}</div>
    </div>
  );
}