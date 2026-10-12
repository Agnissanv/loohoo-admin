import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerAvis, modererAvis, resumeSources, ilYA } from '../api/loohoo.js';

/*
  ÉCRAN « AVIS DES ACHETEURS » — source : admin_liste_avis(p_statut), migration 0016.

  Un avis n'est visible sur le site qu'après validation par l'équipe : cet écran sert
  exactement à trancher. Publier ou refuser passe par admin_moderer_avis ; un refus
  demande un motif (la fonction l'exige).

  La moyenne et la répartition des notes portent sur les avis listés à l'écran,
  jamais sur une estimation.
*/

const ONGLETS = [
  { cle: 'en_attente', libelle: 'À modérer' },
  { cle: 'publie', libelle: 'Publiés' },
  { cle: 'rejete', libelle: 'Refusés' },
];

export default function Avis() {
  const [statut, setStatut] = useState('en_attente');
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [message, setMessage] = useState('');
  const [motif, setMotif] = useState({});

  const charger = (s = statut) => {
    setReel(null);
    chargerAvis(s)
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(() => { charger(statut); }, [statut]);

  async function trancher(avis, publier) {
    setMessage('');
    const m = (motif[avis.id] || '').trim();
    if (!publier && !m) {
      setMessage('Un motif est obligatoire pour refuser un avis.');
      return;
    }
    try {
      await modererAvis(avis.id, publier, publier ? null : m);
      setMessage(publier ? 'Avis publié.' : 'Avis refusé.');
      charger();
    } catch (e) {
      setMessage(`Décision refusée : ${String(e?.message || e)}. Cette action demande un compte administrateur connecté.`);
    }
  }

  const liste = (reel && reel.avis) || [];
  const c = (reel && reel.compte) || {};

  const stats = [
    { libelle: 'Avis à l\'écran', valeur: c.total ?? '—' },
    { libelle: 'Note moyenne (écran)', valeur: c.moyenne ?? '—' },
    { libelle: '5 étoiles', valeur: c.parNote ? c.parNote[5] : '—' },
    { libelle: '1 étoile', valeur: c.parNote ? c.parNote[1] : '—' },
  ];

  const texteBandeau = reel
    ? resumeSources({ avis: 'reel' })
    : (souci
      ? `Lecture des avis impossible (${souci}) — liste réservée à un compte administrateur connecté.`
      : 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — avis des acheteurs" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Avis des acheteurs</h2>
          <p className="loo-esp-hero-resume">
            Avis déposés après une affaire conclue. Ils n'apparaissent sur le site
            qu'après votre validation.
          </p>
          <div className="loo-esp-hero-grille">
            {stats.map((s) => (
              <div className="loo-esp-hero-stat" key={s.libelle}>
                <b>{s.valeur}</b>
                <span>{s.libelle}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="loo-esp-bascule">
          {ONGLETS.map((o) => (
            <button
              type="button"
              key={o.cle}
              className={`loo-esp-bascule-btn${statut === o.cle ? ' actif' : ''}`}
              onClick={() => setStatut(o.cle)}
            >
              {o.libelle}
            </button>
          ))}
        </div>

        {message && <p className="loo-esp-note">{message}</p>}
        {!reel && !souci && <p className="loo-esp-note">Lecture de la base en cours…</p>}
        {souci && <p className="loo-esp-note">La base n'a pas répondu : {souci}.</p>}

        {reel && liste.length === 0 && (
          <p className="loo-esp-note">Aucun avis dans cette catégorie.</p>
        )}

        <div className="loo-esp-liste">
          {liste.map((a) => (
            <div className="loo-esp-item" key={a.id}>
              <span className="loo-esp-item-ic">{'★'.repeat(Number(a.note) || 0) || '☆'}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">
                  {(a.fournisseur || 'Fournisseur')}{a.acheteur ? ` — par ${a.acheteur}` : ''}
                </b>
                <span className="loo-esp-item-l">{a.commentaire || 'Aucun commentaire'}</span>
                <span className="loo-esp-item-l">
                  {a.note}/5
                  {a.quand ? ` · déposé ${ilYA(a.quand)}` : ''}
                  {a.modere ? ` · modéré ${ilYA(a.modere)}` : ''}
                  {a.motif_rejet ? ` · motif : ${a.motif_rejet}` : ''}
                </span>
                {statut === 'en_attente' && (
                  <span className="loo-esp-item-l">
                    <input
                      className="loo-esp-champ"
                      type="text"
                      value={motif[a.id] || ''}
                      onChange={(e) => setMotif((m) => ({ ...m, [a.id]: e.target.value }))}
                      placeholder="Motif (obligatoire pour refuser)"
                    />
                  </span>
                )}
              </span>
              {statut === 'en_attente' ? (
                <>
                  <button type="button" className="loo-esp-bascule-btn" onClick={() => trancher(a, true)}>
                    Publier
                  </button>
                  <button type="button" className="loo-esp-bascule-btn" onClick={() => trancher(a, false)}>
                    Refuser
                  </button>
                </>
              ) : (
                <span className="loo-esp-item-tag">{a.statut}</span>
              )}
            </div>
          ))}
        </div>

        <p className="loo-esp-note">
          La moyenne affichée porte sur les avis de l'onglet ouvert. La moyenne publique
          d'un fournisseur est calculée côté site par resume_avis(fournisseur).
        </p>
      </div>
    </div>
  );
}
