import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { recupererLeads } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { exporterCsv, formatDateHeure } from '../utils/format.js';

const dateDe = (l) => l.date || l.created_at || l.date_creation || null;
const SOURCES = { 'landing-vendeurs': 'looh-oo.com : « Vendre en ligne »' };

// E-mails de ceux qui veulent ouvrir une boutique : à prévenir à l'ouverture de la plateforme Boutiques
export default function LeadsBoutiques() {
  const { donnees, erreur } = useAdminDonnees(recupererLeads);
  const liste = useMemo(() => (donnees || [])
    .filter((l) => String(l.recherche || '').startsWith('landing-'))
    .sort((a, b) => new Date(dateDe(b) || 0) - new Date(dateDe(a) || 0)), [donnees]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Demandes d'ouverture de boutique{donnees ? ` (${liste.length})` : ''}</h1>
        <button type="button" className="btn btn-outline" disabled={!liste.length} onClick={() => exporterCsv('demandes-ouverture-boutique', [
          { titre: 'E-mail', valeur: (l) => l.email }, { titre: 'Origine', valeur: (l) => SOURCES[l.recherche] || l.recherche }, { titre: 'Date', valeur: (l) => formatDateHeure(dateDe(l)) },
        ], liste)}><Download size={16} /> Exporter</button>
      </div>
      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '72ch' }}>
        Personnes qui ont laissé leur e-mail pour être prévenues dès l'ouverture de la création de boutiques. À utiliser dans le respect de la politique de confidentialité.
      </p>
      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && liste.length === 0 && <p style={{ opacity: 0.7 }}>Aucune demande pour l'instant.</p>}
      {liste.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>E-mail</th><th>Origine</th><th>Date</th></tr></thead>
            <tbody>{liste.map((l, i) => <tr key={l.id ?? i}><td><strong>{l.email}</strong></td><td>{SOURCES[l.recherche] || l.recherche}</td><td>{formatDateHeure(dateDe(l))}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
