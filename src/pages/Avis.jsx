import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { recupererAvis, modererAvis } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import MotifModal from '../components/MotifModal.jsx';
import { formatDate, formatPrix } from '../utils/format.js';

const FILTRES = [['en_attente', 'À valider'], ['publie', 'Publiés'], ['rejete', 'Rejetés']];
const STATUTS = {
  en_attente: { texte: 'À valider', classe: 'esp-puce-orange' },
  publie: { texte: 'Publié', classe: 'esp-puce-vert' },
  rejete: { texte: 'Rejeté', classe: 'esp-puce-rouge' },
};

const Etoiles = ({ note }) => (
  <span role="img" aria-label={`${note} sur 5`} style={{ display: 'inline-flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} aria-hidden="true" fill={n <= note ? 'var(--loo-orange)' : 'none'} color="var(--loo-orange)" />)}
  </span>
);

// Chaque avis est lu avant d'être visible des acheteurs : contenu hors sujet, injure, coordonnées déguisées, etc.
export default function Avis() {
  const [params, setParams] = useSearchParams();
  const filtre = FILTRES.some(([k]) => k === params.get('filtre')) ? params.get('filtre') : 'en_attente';
  const [erreurAction, setErreurAction] = useState('');
  const [rejet, setRejet] = useState(null);
  const { donnees, erreur, recharger } = useAdminDonnees(recupererAvis);
  const visibles = useMemo(() => (donnees || []).filter((a) => a.statut === filtre), [donnees, filtre]);

  async function agir(action) {
    setErreurAction('');
    try { await action(); await recharger(); } catch (err) { setErreurAction(err.message || 'Action impossible.'); }
  }

  return (
    <>
      <h1 className="esp-titre-page">Avis des acheteurs</h1>
      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '75ch' }}>
        Un acheteur ne peut donner son avis qu'après une affaire confirmée par les deux parties. Aucun avis n'est visible avant votre validation.
        Le public voit la note, le commentaire et l'activité de l'acheteur, jamais son nom.
      </p>

      <div className="adm-onglets">
        {FILTRES.map(([cle, texte]) => (
          <button key={cle} type="button" className={`adm-onglet${filtre === cle ? ' adm-onglet-actif' : ''}`} onClick={() => setParams({ filtre: cle })}>
            {texte}{donnees ? ` (${donnees.filter((a) => a.statut === cle).length})` : ''}
          </button>
        ))}
      </div>

      {(erreur || erreurAction) && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || erreurAction}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '160px' }} />}
      {donnees && visibles.length === 0 && <p style={{ opacity: 0.7 }}>Aucun avis dans cette catégorie.</p>}

      {visibles.map((a) => {
        const st = STATUTS[a.statut] || STATUTS.en_attente;
        return (
          <div key={a.id} className="esp-carte" style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <Etoiles note={a.note} />
                <div style={{ fontWeight: 700, marginTop: '0.3rem' }}>{a.grossiste_nom} <span style={{ fontWeight: 400, opacity: 0.7 }}>par {a.vendeur_nom}</span></div>
                <div className="esp-aide">{formatDate(a.date_creation)}{a.montant_fcfa ? ` · affaire de ${formatPrix(a.montant_fcfa)}` : ''}</div>
              </div>
              <span className={`esp-puce ${st.classe}`} style={{ alignSelf: 'flex-start' }}>{st.texte}</span>
            </div>
            <p style={{ margin: '0.6rem 0', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{a.commentaire || <em style={{ opacity: 0.6 }}>Note seule, sans commentaire.</em>}</p>
            <div className="adm-actions">
              {a.statut !== 'publie' && <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => agir(() => modererAvis(a.id, true))}>Publier</button>}
              {a.statut !== 'rejete' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setRejet(a)}>Rejeter</button>}
            </div>
          </div>
        );
      })}

      {rejet && (
        <MotifModal
          titre="Rejeter cet avis"
          description="Le motif est communiqué à l'acheteur."
          libelleBouton="Rejeter l'avis"
          danger
          onConfirmer={(motif) => modererAvis(rejet.id, false, motif).then(recharger)}
          onFermer={() => setRejet(null)}
        />
      )}
    </>
  );
}
