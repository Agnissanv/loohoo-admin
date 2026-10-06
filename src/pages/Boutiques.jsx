import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { recupererStatsBoutiques } from '../api/admin.js';
import { supabase } from '../supabaseClient.js';

// Lien vers l'admin propre à chaque boutique (elles gardent leur propre interface)
const LIENS_ADMIN = { medithe: 'https://medithe.looh-oo.com/admin' };

export default function Boutiques() {
  const [stats, setStats] = useState(undefined);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => recupererStatsBoutiques(data.session.access_token))
      .then(setStats)
      .catch((err) => setErreur(err.message || 'Impossible de charger les statistiques des boutiques.'));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1 className="esp-titre-page">Boutiques connectées</h1>
        <p className="section-intro" style={{ marginBottom: '1.6rem' }}>
          Chaque boutique garde sa propre interface d'administration ; cette vue n'est qu'un aperçu en lecture.
        </p>

        {erreur && <p style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
        {stats === undefined && !erreur && <div className="loo-squelette" style={{ height: '140px' }} />}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {stats?.map((b) => (
            <div key={b.id} className="carte" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{b.nom}</strong>
                {b.erreur ? (
                  <p style={{ color: 'var(--loo-rouge)', margin: '0.4rem 0 0', fontSize: '0.85rem' }}>{b.erreur}</p>
                ) : (
                  <div style={{ display: 'flex', gap: '1.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <Stat label="Produits en ligne" valeur={b.nbProduits} />
                    <Stat label="Commandes valides" valeur={b.nbCommandes} />
                    <Stat label="Chiffre d'affaires" valeur={`${b.chiffreAffaires.toLocaleString('fr-FR')} F CFA`} />
                  </div>
                )}
              </div>
              {LIENS_ADMIN[b.id] && (
                <a href={LIENS_ADMIN[b.id]} target="_blank" rel="noreferrer" className="btn btn-outline">
                  Ouvrir son admin <ExternalLink size={15} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, valeur }) {
  return (
    <div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--police-etiquette)' }}>{valeur}</div>
      <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{label}</div>
    </div>
  );
}