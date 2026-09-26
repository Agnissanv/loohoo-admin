import React, { useState } from 'react';
import { BadgeCheck, MapPin, Package, Phone } from 'lucide-react';
import { changerStatut, changerBadgeVerifie } from '../api/admin.js';

const STATUTS = {
  en_attente: { texte: 'En attente', couleur: 'var(--loo-orange)' },
  publie: { texte: 'Publié', couleur: '#2f8f4e' },
  suspendu: { texte: 'Suspendu', couleur: 'var(--loo-rouge)' },
};

export default function CarteFournisseurAdmin({ f, onChange }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const statut = STATUTS[f.statut];
  const aLesPrerequis = f.grossiste_photo.length > 0 && f.grossiste_contact.length > 0 && f.stock_confirme;

  async function agir(action) {
    setEnCours(true);
    setErreur('');
    try {
      await action();
      onChange();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="carte" style={{ padding: '1.1rem', display: 'grid', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <strong>{f.nom}</strong>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.2rem' }}>{f.categorie}</div>
        </div>
        <span style={{ color: statut.couleur, fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{statut.texte}</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', opacity: 0.75 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={14} /> {f.ville}{f.commune ? `, ${f.commune}` : ''}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Package size={14} /> {f.produit.length} produit{f.produit.length > 1 ? 's' : ''}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Phone size={14} /> {f.grossiste_contact.length > 0 ? 'Contact renseigné' : 'Contact manquant'}
        </span>
      </div>

      {!aLesPrerequis && f.statut !== 'publie' && (
        <p style={{ fontSize: '0.8rem', color: 'var(--loo-orange)', margin: 0 }}>
          Pas encore publiable : il manque une photo, un contact, ou la confirmation du stock.
        </p>
      )}
      {erreur && <p style={{ fontSize: '0.8rem', color: 'var(--loo-rouge)', margin: 0 }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
        {f.statut !== 'publie' && (
          <button
            type="button" className="btn btn-primary" disabled={enCours || !aLesPrerequis}
            style={{ padding: '0.5em 1em', fontSize: '0.85rem' }}
            onClick={() => agir(() => changerStatut(f.id, 'publie'))}
          >
            Publier
          </button>
        )}
        {f.statut === 'publie' && (
          <button
            type="button" className="btn btn-outline" disabled={enCours}
            style={{ padding: '0.5em 1em', fontSize: '0.85rem' }}
            onClick={() => agir(() => changerStatut(f.id, 'suspendu'))}
          >
            Suspendre
          </button>
        )}
        {f.statut === 'suspendu' && (
          <button
            type="button" className="btn btn-outline" disabled={enCours}
            style={{ padding: '0.5em 1em', fontSize: '0.85rem' }}
            onClick={() => agir(() => changerStatut(f.id, 'en_attente'))}
          >
            Remettre en attente
          </button>
        )}
        <button
          type="button" className="btn btn-outline" disabled={enCours}
          style={{ padding: '0.5em 1em', fontSize: '0.85rem' }}
          onClick={() => agir(() => changerBadgeVerifie(f.id, !f.badge_verifie))}
        >
          <BadgeCheck size={15} /> {f.badge_verifie ? 'Retirer le badge Vérifié' : 'Attribuer le badge Vérifié'}
        </button>
      </div>
    </div>
  );
}