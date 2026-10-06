import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { recupererLeads } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { exporterCsv, formatDateHeure } from '../utils/format.js';

// La colonne de date s'appelle « date » ou « created_at » selon la base : on accepte les deux
const dateDe = (l) => l.date || l.created_at || l.date_creation || null;

export default function Leads() {
  const { donnees, erreur } = useAdminDonnees(recupererLeads);
  const liste = useMemo(() => [...(donnees || [])].sort((a, b) => new Date(dateDe(b) || 0) - new Date(dateDe(a) || 0)), [donnees]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Leads{donnees ? ` (${donnees.length})` : ''}</h1>
        <button type="button" className="btn btn-outline" disabled={!liste.length} onClick={() => exporterCsv('leads', [
          { titre: 'E-mail', valeur: (l) => l.email }, { titre: 'Recherche ou besoin', valeur: (l) => l.recherche }, { titre: 'Date', valeur: (l) => formatDateHeure(dateDe(l)) },
        ], liste)}><Download size={16} /> Exporter</button>
      </div>
      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '70ch' }}>
        E-mails laissés par des visiteurs : sortie de page, demandes de sourcing sans résultat, ou intérêt pour la création de boutique. À utiliser dans le respect de la politique de confidentialité.
      </p>
      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && liste.length === 0 && <p style={{ opacity: 0.7 }}>Aucun lead pour l'instant.</p>}
      {liste.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>E-mail</th><th>Recherche ou besoin</th><th>Date</th></tr></thead>
            <tbody>{liste.map((l, i) => <tr key={l.id ?? i}><td><strong>{l.email}</strong></td><td>{l.recherche || <em style={{ opacity: 0.5 }}>–</em>}</td><td>{formatDateHeure(dateDe(l))}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
