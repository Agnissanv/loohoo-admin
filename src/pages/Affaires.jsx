import React, { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { recupererAffaires, trancherAffaire, statutCommission, definirTaux } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import MotifModal from '../components/MotifModal.jsx';
import { exporterCsv, formatDate, formatPrix } from '../utils/format.js';

const FILTRES = [['contestee', 'À arbitrer'], ['proposee', 'En attente de confirmation'], ['confirmee', 'Confirmées'], ['tous', 'Toutes']];
const STATUTS = {
  proposee: { texte: 'En attente', classe: 'esp-puce-orange' },
  confirmee: { texte: 'Confirmée', classe: 'esp-puce-vert' },
  contestee: { texte: 'Contestée', classe: 'esp-puce-rouge' },
  annulee: { texte: 'Annulée', classe: 'esp-puce-neutre' },
};
const STATUTS_COMMISSION = {
  a_facturer: { texte: 'À facturer', classe: 'esp-puce-orange' },
  facturee: { texte: 'Facturée', classe: 'esp-puce-neutre' },
  payee: { texte: 'Payée', classe: 'esp-puce-vert' },
  annulee: { texte: 'Annulée', classe: 'esp-puce-neutre' },
};

// La commission liée à l'affaire (la base renvoie un objet, ou une liste selon la relation)
const commissionDe = (a) => (Array.isArray(a.commission) ? a.commission[0] : a.commission) || null;

export default function Affaires() {
  const { compteurs, rafraichir, superAdmin } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const filtre = FILTRES.some(([k]) => k === params.get('filtre')) ? params.get('filtre') : 'confirmee';
  const [erreurAction, setErreurAction] = useState('');
  const [note, setNote] = useState(null); // { affaire, statut }
  const [taux, setTaux] = useState('');
  const { donnees, erreur, recharger } = useAdminDonnees(recupererAffaires);

  const visibles = useMemo(() => (donnees || []).filter((a) => filtre === 'tous' || a.statut === filtre), [donnees, filtre]);
  const aff = compteurs?.affaires;

  async function agir(action) {
    setErreurAction('');
    try { await action(); await recharger(); rafraichir(); } catch (err) { setErreurAction(err.message || 'Action impossible.'); }
  }

  async function enregistrerTaux(e) {
    e.preventDefault();
    await agir(() => definirTaux(Number(String(taux).replace(',', '.'))));
    setTaux('');
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Affaires et commissions</h1>
        <button type="button" className="btn btn-outline" disabled={!visibles.length} onClick={() => exporterCsv('affaires', [
          { titre: 'Date', valeur: (a) => formatDate(a.date_declaration) }, { titre: 'Fournisseur', valeur: (a) => a.grossiste_nom }, { titre: 'Acheteur', valeur: (a) => a.vendeur_nom },
          { titre: 'Produit', valeur: (a) => a.produit_nom }, { titre: 'Montant', valeur: (a) => a.montant_fcfa }, { titre: 'Statut', valeur: (a) => STATUTS[a.statut]?.texte },
          { titre: 'Taux', valeur: (a) => commissionDe(a)?.taux_pourcent }, { titre: 'Commission', valeur: (a) => commissionDe(a)?.montant_fcfa },
          { titre: 'État de la commission', valeur: (a) => STATUTS_COMMISSION[commissionDe(a)?.statut]?.texte },
        ], visibles)}><Download size={16} /> Exporter</button>
      </div>

      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '75ch' }}>
        Une affaire est déclarée par l'acheteur ou le fournisseur dans la conversation, puis confirmée par l'autre partie. Seules les affaires confirmées génèrent une commission.
        Les paiements restent hors plateforme : vous suivez ici ce qui est dû, facturé et payé.
      </p>

      {aff && (
        <div className="esp-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: '1rem' }}>
          <div className="esp-carte"><div className="esp-kpi-etiquette">Affaires confirmées</div><div className="esp-kpi-valeur">{aff.confirmees}</div></div>
          <div className="esp-carte"><div className="esp-kpi-etiquette">Volume confirmé</div><div className="esp-kpi-valeur" style={{ fontSize: '1.2rem' }}>{formatPrix(aff.volume_fcfa)}</div></div>
          <div className="esp-carte"><div className="esp-kpi-etiquette">Commission à facturer</div><div className="esp-kpi-valeur" style={{ fontSize: '1.2rem', color: 'var(--loo-rouge)' }}>{formatPrix(aff.commission_a_facturer)}</div></div>
          <div className="esp-carte"><div className="esp-kpi-etiquette">Facturée</div><div className="esp-kpi-valeur" style={{ fontSize: '1.2rem' }}>{formatPrix(aff.commission_facturee)}</div></div>
          <div className="esp-carte"><div className="esp-kpi-etiquette">Payée</div><div className="esp-kpi-valeur" style={{ fontSize: '1.2rem', color: '#1f7a3d' }}>{formatPrix(aff.commission_payee)}</div></div>
        </div>
      )}

      {!superAdmin && <p className="esp-carte" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Lecture seule : le taux et le suivi des commissions sont réservés aux super-administrateurs.</p>}
      {superAdmin && <div className="esp-carte" style={{ marginBottom: '1rem' }}>
        <h2 className="esp-carte-titre">Taux de commission</h2>
        <form onSubmit={enregistrerTaux} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem' }}>Taux actuel : <strong>{aff ? `${aff.taux} %` : '–'}</strong></span>
          <input className="champ" style={{ width: '140px' }} inputMode="decimal" placeholder="Nouveau taux (%)" value={taux} onChange={(e) => setTaux(e.target.value)} aria-label="Nouveau taux en pourcent" />
          <button type="submit" className="btn btn-primary adm-bouton-petit" disabled={!taux.trim()}>Enregistrer</button>
        </form>
        <p className="esp-aide" style={{ margin: '0.5rem 0 0' }}>
          S'applique aux affaires confirmées à partir de maintenant ; les affaires déjà confirmées gardent leur taux.
          {aff && Number(aff.taux) === 0 && ' Le taux est à 0 % : à fixer avec le client.'}
        </p>
      </div>}

      <div className="adm-onglets">
        {FILTRES.map(([cle, texte]) => (
          <button key={cle} type="button" className={`adm-onglet${filtre === cle ? ' adm-onglet-actif' : ''}`} onClick={() => setParams({ filtre: cle })}>
            {texte}{donnees ? ` (${donnees.filter((a) => cle === 'tous' || a.statut === cle).length})` : ''}
          </button>
        ))}
      </div>

      {(erreur || erreurAction) && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || erreurAction}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && visibles.length === 0 && <p style={{ opacity: 0.7 }}>Aucune affaire dans cette catégorie.</p>}

      {visibles.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Fournisseur</th><th>Acheteur</th><th>Montant</th><th>Statut</th><th>Commission</th><th>Actions</th></tr></thead>
            <tbody>
              {visibles.map((a) => {
                const st = STATUTS[a.statut] || STATUTS.proposee;
                const co = commissionDe(a);
                const sc = co ? STATUTS_COMMISSION[co.statut] : null;
                return (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.date_declaration)}<div className="esp-aide">par {a.declaree_par === 'fournisseur' ? 'le fournisseur' : "l'acheteur"}</div></td>
                    <td>{a.grossiste_id ? <Link to={`/fournisseurs/${a.grossiste_id}`} style={{ textDecoration: 'underline' }}>{a.grossiste_nom}</Link> : a.grossiste_nom}</td>
                    <td>{a.vendeur_nom}{a.produit_nom && <div className="esp-aide">{a.produit_nom}</div>}</td>
                    <td><strong>{formatPrix(a.montant_fcfa)}</strong>{a.description && <div className="esp-aide">{a.description}</div>}</td>
                    <td><span className={`esp-puce ${st.classe}`}>{st.texte}</span></td>
                    <td>{co ? <><strong>{formatPrix(co.montant_fcfa)}</strong> <span className="esp-aide">({co.taux_pourcent} %)</span><div><span className={`esp-puce ${sc.classe}`}>{sc.texte}</span></div>{co.note && <div className="esp-aide">{co.note}</div>}</> : <span className="esp-aide">–</span>}</td>
                    <td>
                      <div className="adm-actions">
                        {superAdmin && (a.statut === 'contestee' || a.statut === 'proposee') && (
                          <>
                            <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => agir(() => trancherAffaire(a.id, 'confirmee'))}>Confirmer</button>
                            <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => agir(() => trancherAffaire(a.id, 'annulee'))}>Annuler</button>
                          </>
                        )}
                        {superAdmin && co && co.statut === 'a_facturer' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setNote({ affaire: a, statut: 'facturee' })}>Marquer facturée</button>}
                        {superAdmin && co && co.statut === 'facturee' && <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => setNote({ affaire: a, statut: 'payee' })}>Marquer payée</button>}
                        {superAdmin && co && co.statut !== 'annulee' && co.statut !== 'payee' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setNote({ affaire: a, statut: 'annulee' })}>Annuler la commission</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {note && (
        <MotifModal
          titre={`Commission : ${STATUTS_COMMISSION[note.statut].texte.toLowerCase()}`} description="Ajoutez si besoin une référence (numéro de facture, mode de paiement…)."
          obligatoire={false} libelleBouton="Enregistrer" danger={note.statut === 'annulee'}
          onConfirmer={(texte) => statutCommission(note.affaire.id, note.statut, texte).then(async () => { await recharger(); rafraichir(); })} onFermer={() => setNote(null)}
        />
      )}
    </>
  );
}
