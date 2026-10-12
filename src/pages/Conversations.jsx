import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerConversations, marquerMessageTraite, resumeSources, ilYA } from '../api/loohoo.js';

/*
  ÉCRAN « CONVERSATIONS » — source : tables `conversation` et `message` (admin).

  Colonnes réelles : conversation — derniere_activite, grossiste_id, vendeur_id,
  produit_id ; message — expediteur ('vendeur' ou 'fournisseur'), contenu, date_envoi,
  lu, signale, signale_traite.

  Deux renseignements sont donc réels : « le fournisseur a répondu » (un message de
  type fournisseur existe) et « message signalé à traiter » (signale sans signale_traite).
  En revanche il n'existe AUCUNE colonne de statut ni de « conclue » en base : ces
  cases restent marquées « pas connecté » au lieu d'être remplies au hasard.
*/

export default function Conversations() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [message, setMessage] = useState('');
  const [ouvert, setOuvert] = useState({});

  const charger = () => {
    chargerConversations()
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(() => { charger(); }, []);

  async function traiter(m) {
    setMessage('');
    try {
      await marquerMessageTraite(m.id, true);
      setMessage('Message marqué comme traité.');
      charger();
    } catch (e) {
      setMessage(`Action refusée : ${String(e?.message || e)}. Elle demande un compte administrateur connecté.`);
    }
  }

  const liste = (reel && reel.conversations) || [];
  const c = (reel && reel.compte) || {};

  const stats = [
    { libelle: 'Conversations', valeur: c.total ?? '—' },
    { libelle: 'Sans réponse du fournisseur', valeur: c.sansReponse ?? '—' },
    { libelle: 'Messages signalés à traiter', valeur: c.signales ?? '—' },
    { libelle: 'Statut conclu', valeur: 'pas connecté' },
  ];

  const texteBandeau = reel
    ? resumeSources({ conversations: 'reel', messages: 'reel' })
    : (souci
      ? `Lecture des conversations impossible (${souci}) — table réservée à un compte administrateur connecté.`
      : 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — conversations" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Conversations</h2>
          <p className="loo-esp-hero-resume">
            Les échanges entre acheteurs et fournisseurs. On voit qui a répondu et ce qui
            reste sans réponse — c'est le meilleur signal pour relancer un fournisseur.
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

        {message && <p className="loo-esp-note">{message}</p>}
        {!reel && !souci && <p className="loo-esp-note">Lecture de la base en cours…</p>}
        {souci && <p className="loo-esp-note">La base n'a pas répondu : {souci}.</p>}

        {reel && liste.length === 0 && (
          <p className="loo-esp-note">Aucune conversation enregistrée dans la base.</p>
        )}

        <div className="loo-esp-liste">
          {liste.map((cv) => (
            <div className="loo-esp-item" key={cv.id}>
              <span className={`loo-esp-item-ic ${cv.repondu ? 'ok' : 'attente'}`}>
                {cv.repondu ? '💬' : '⏳'}
              </span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">
                  {cv.acheteur?.nom || 'Acheteur'} → {cv.fournisseur?.nom || 'Fournisseur'}
                </b>
                <span className="loo-esp-item-l">
                  {cv.nbMessages} message{cv.nbMessages > 1 ? 's' : ''}
                  {cv.quand ? ` · dernière activité ${ilYA(cv.quand)}` : ''}
                  {cv.fournisseur?.ville ? ` · ${cv.fournisseur.ville}` : ''}
                </span>
                <span className="loo-esp-item-l">
                  {cv.repondu ? 'Le fournisseur a répondu' : 'Le fournisseur n\'a jamais répondu'}
                  {cv.signales ? ` · ${cv.signales} message(s) signalé(s) à traiter` : ''}
                  {' · statut : pas connecté (aucune colonne de statut en base)'}
                </span>
                {ouvert[cv.id] && (
                  <span className="loo-esp-item-l">
                    {cv.messages.slice(-3).map((m) => (
                      <span key={m.id}>
                        <b>{m.expediteur === 'fournisseur' ? 'Fournisseur' : 'Acheteur'} :</b>{' '}
                        {m.contenu}
                        {m.signale && !m.signale_traite ? ' ⚠️ signalé' : ''}
                        {m.date_envoi ? ` (${ilYA(m.date_envoi)})` : ''}
                        <br />
                        {m.signale && !m.signale_traite && (
                          <button type="button" className="loo-esp-bascule-btn" onClick={() => traiter(m)}>
                            Marquer traité
                          </button>
                        )}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <button
                type="button"
                className="loo-esp-bascule-btn"
                onClick={() => setOuvert((o) => ({ ...o, [cv.id]: !o[cv.id] }))}
              >
                {ouvert[cv.id] ? 'Fermer' : 'Voir les messages'}
              </button>
            </div>
          ))}
        </div>

        <p className="loo-esp-note">
          Les conversations sans réponse depuis plus de 7 jours sont le signal le plus utile
          pour relancer : la date de dernière activité vient de la base.
        </p>
      </div>
    </div>
  );
}
