import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { recupererJournal } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { exporterCsv, formatDateHeure } from '../utils/format.js';

const ACTIONS = {
  fournisseur_statut: 'Statut du fournisseur',
  fournisseur_badge: 'Badge « Vérifié »',
  produit_statut: "Statut d'un produit",
  produit_stock: 'Vérification du stock',
  document_statut: "Statut d'un document",
  affaire_statut: "Statut d'une affaire",
  commission_statut: 'Commission',
  taux_commission: 'Taux de commission',
  admin_ajout: "Ajout d'un administrateur",
  admin_role: "Rôle d'un administrateur",
  admin_retrait: "Retrait d'un administrateur",
  categorie_renommee: 'Catégorie renommée',
};

function resume(l) {
  const d = l.details || {};
  if (l.action === 'produit_stock') return `${d.nom || ''} : stock ${d.verifie ? 'vérifié' : 'retiré'}`;
  if (l.action === 'admin_ajout') return `${d.email} (${d.role})`;
  if (l.action === 'admin_role') return `Nouveau rôle : ${d.role}`;
  if (l.action === 'admin_retrait') return 'Accès retiré';
  if (l.action === 'categorie_renommee') return `${d.avant} → ${d.apres}`;
  if (l.action === 'taux_commission') return `${d.avant} % → ${d.apres} %`;
  if (l.action === 'affaire_statut') return `${d.acheteur || ''} / ${d.fournisseur || ''} : ${d.avant} → ${d.apres} (${Number(d.montant || 0).toLocaleString('fr-FR')} F CFA)`;
  if (l.action === 'document_statut') return `${d.statut}${d.motif ? ` (${d.motif})` : ''}`;
  const base = `${d.nom ? `${d.nom} : ` : ''}${String(d.avant)} → ${String(d.apres)}`;
  return d.motif ? `${base} (${d.motif})` : base;
}

// Registre inaltérable : personne ne peut modifier ni effacer une ligne (écriture réservée à la base).
export default function Journal() {
  const [filtre, setFiltre] = useState('toutes');
  const { donnees, erreur } = useAdminDonnees(() => recupererJournal(500));
  const liste = useMemo(() => (donnees || []).filter((l) => filtre === 'toutes' || l.action === filtre), [donnees, filtre]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Journal d'audit</h1>
        <button type="button" className="btn btn-outline" disabled={!liste.length} onClick={() => exporterCsv('journal', [
          { titre: 'Date', valeur: (l) => formatDateHeure(l.date_action) }, { titre: 'Action', valeur: (l) => ACTIONS[l.action] || l.action },
          { titre: 'Cible', valeur: (l) => `${l.cible_type} ${l.cible_id}` }, { titre: 'Détail', valeur: resume }, { titre: 'Admin', valeur: (l) => l.admin_id },
        ], liste)}><Download size={16} /> Exporter</button>
      </div>
      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '70ch' }}>Chaque décision d'un administrateur est enregistrée automatiquement : qui, quoi, quand, ancienne et nouvelle valeur.</p>

      <div className="adm-onglets">
        <button type="button" className={`adm-onglet${filtre === 'toutes' ? ' adm-onglet-actif' : ''}`} onClick={() => setFiltre('toutes')}>Toutes</button>
        {Object.entries(ACTIONS).map(([k, t]) => <button key={k} type="button" className={`adm-onglet${filtre === k ? ' adm-onglet-actif' : ''}`} onClick={() => setFiltre(k)}>{t}</button>)}
      </div>

      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && liste.length === 0 && <p style={{ opacity: 0.7 }}>Aucune décision enregistrée.</p>}
      {liste.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Action</th><th>Détail</th><th>Cible</th><th>Admin</th></tr></thead>
            <tbody>
              {liste.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateHeure(l.date_action)}</td>
                  <td><strong>{ACTIONS[l.action] || l.action}</strong></td>
                  <td>{resume(l)}</td>
                  <td>{l.cible_type === 'grossiste' ? <Link to={`/f/fournisseurs/${l.cible_id}`} style={{ textDecoration: 'underline' }}>Fournisseur</Link> : l.cible_type}</td>
                  <td className="esp-aide" title={l.admin_id}>{String(l.admin_id || '').slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
