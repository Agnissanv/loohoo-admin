import React, { useState } from 'react';
import { BadgeCheck, ChevronDown, ChevronUp, MapPin, Package, Phone, MessageCircle } from 'lucide-react';
import { changerStatut, changerBadgeVerifie, modererProduit } from '../api/admin.js';

const STATUTS = {
  en_attente: { texte: 'En attente', couleur: 'var(--loo-orange)' },
  publie: { texte: 'Publié', couleur: '#2f8f4e' },
  suspendu: { texte: 'Suspendu', couleur: 'var(--loo-rouge)' },
};

export default function CarteFournisseurAdmin({ f, onChange }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const [ouvert, setOuvert] = useState(false);

  const statut = STATUTS[f.statut];
  const telephone = f.grossiste_contact[0]?.telephone || null;
  const numeroWhatsApp = telephone ? telephone.replace(/[^0-9]/g, '') : null;
  const aLesPrerequis = f.grossiste_photo.length > 0 && !!telephone && f.stock_confirme;

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
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.2rem' }}>
            {f.categorie}{f.est_fabricant && ' · Fabricant local'}
          </div>
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
          <Phone size={14} /> {telephone ? 'Contact renseigné' : 'Contact manquant'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--loo-rouge)', justifySelf: 'start' }}
      >
        {ouvert ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {ouvert ? 'Masquer le détail' : 'Voir le détail (pour vérifier)'}
      </button>

      {ouvert && (
        <div style={{ borderTop: '1px solid var(--loo-papier-ombre)', paddingTop: '0.8rem', display: 'grid', gap: '0.9rem' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Contact à vérifier</p>
            {telephone ? (
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--police-etiquette)', fontSize: '0.9rem' }}>{telephone}</span>
                <a href={`tel:${numeroWhatsApp}`} className="btn btn-outline" style={{ padding: '0.3em 0.8em', fontSize: '0.8rem' }}>
                  <Phone size={14} /> Appeler
                </a>
                <a href={`https://wa.me/${numeroWhatsApp}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.3em 0.8em', fontSize: '0.8rem' }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            ) : (
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Aucun numéro renseigné.</p>
            )}
          </div>

          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Photos ({f.grossiste_photo.length})</p>
            {f.grossiste_photo.length > 0 ? (
              <div className="photos-grossiste" style={{ margin: 0 }}>
                {f.grossiste_photo.map((p) => (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer">
                    <img src={p.url} alt="" loading="lazy" />
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Aucune photo.</p>
            )}
          </div>

          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 0.4rem' }}>
              Catalogue — chaque produit doit être vérifié individuellement
            </p>
            {f.produit.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {f.produit.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.85rem', borderBottom: '1px solid var(--loo-papier-ombre)', paddingBottom: '0.4rem' }}>
                    <div>
                      <strong>{p.nom}</strong> — {p.prix_gros_fcfa.toLocaleString('fr-FR')} F CFA (min. {p.moq})
                      <span style={{ marginLeft: '0.6rem', fontWeight: 700, color: p.statut === 'publie' ? '#2f8f4e' : p.statut === 'rejete' ? 'var(--loo-rouge)' : 'var(--loo-orange)' }}>
                        {p.statut === 'publie' ? 'Publié' : p.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {p.statut !== 'publie' && (
                        <button type="button" className="btn btn-primary" disabled={enCours} style={{ padding: '0.3em 0.8em', fontSize: '0.78rem' }}
                          onClick={() => agir(() => modererProduit(p.id, 'publie'))}>
                          Publier
                        </button>
                      )}
                      {p.statut !== 'rejete' && (
                        <button type="button" className="btn btn-outline" disabled={enCours} style={{ padding: '0.3em 0.8em', fontSize: '0.78rem' }}
                          onClick={() => {
                            const motif = window.prompt('Motif du rejet (visible par le fournisseur) :');
                            if (motif !== null) agir(() => modererProduit(p.id, 'rejete', motif));
                          }}>
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Aucun produit ajouté.</p>
            )}
          </div>
        </div>
      )}

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