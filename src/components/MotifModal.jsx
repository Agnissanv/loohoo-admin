import React, { useState } from 'react';
import { X } from 'lucide-react';

// Fenêtre de décision motivée : le motif est obligatoire quand `obligatoire` est vrai (suspension, rejet).
// Le texte est visible par le fournisseur dans son espace.
export default function MotifModal({ titre, description, modeles = [], obligatoire = true, libelleBouton = 'Confirmer', danger = false, onConfirmer, onFermer }) {
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  async function valider(e) {
    e.preventDefault();
    if (obligatoire && !motif.trim()) { setErreur('Un motif est obligatoire.'); return; }
    setEnvoi(true);
    setErreur('');
    try {
      await onConfirmer(motif.trim() || null);
      onFermer();
    } catch (err) {
      setErreur(err.message || 'Impossible de valider.');
      setEnvoi(false);
    }
  }

  return (
    <div className="modale-fond" onClick={onFermer}>
      <form className="modale" role="dialog" aria-modal="true" style={{ width: 'min(100%, 520px)' }} onClick={(e) => e.stopPropagation()} onSubmit={valider}>
        <button type="button" className="modale-fermer" onClick={onFermer} aria-label="Fermer"><X size={20} /></button>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>{titre}</h2>
        {description && <p style={{ margin: '0 0 0.9rem', opacity: 0.8, fontSize: '0.9rem' }}>{description}</p>}
        {modeles.length > 0 && (
          <div className="msg-rapides" style={{ flexWrap: 'wrap', overflow: 'visible', mask: 'none', WebkitMask: 'none' }}>
            {modeles.map((m) => <button key={m} type="button" onClick={() => setMotif(m)}>{m}</button>)}
          </div>
        )}
        <textarea className="champ" rows={4} autoFocus placeholder={obligatoire ? 'Motif (obligatoire, visible par le fournisseur)' : 'Motif (facultatif)'} value={motif} onChange={(e) => setMotif(e.target.value)} />
        {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.88rem', margin: '0.6rem 0 0' }}>{erreur}</p>}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={onFermer}>Annuler</button>
          <button type="submit" className={`btn btn-primary${danger ? ' adm-bouton-danger' : ''}`} disabled={envoi}>{envoi ? 'Enregistrement…' : libelleBouton}</button>
        </div>
      </form>
    </div>
  );
}
