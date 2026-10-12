import React, { useEffect, useMemo, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerAcheteurs, resumeSources, ilYA } from '../api/loohoo.js';

/*
  ÉCRAN « ACHETEURS » — onglet du module Fournisseurs (maquette n02).

  Source : admin_vendeurs() — migration 0010. La table `vendeur` n'est pas lisible
  directement : seul l'administrateur la reçoit, en entier, par cette fonction.
  Sans compte admin connecté, la base répond « permission denied » et l'écran
  l'écrit noir sur blanc au lieu d'afficher des lignes inventées.

  Affichage : le téléphone et l'e-mail sont masqués par défaut (la liste sert à
  comprendre qui achète, pas à exposer des coordonnées). Un clic affiche la valeur
  réellement reçue de la base.
*/

function masquer(valeur) {
  if (!valeur) return '—';
  const t = String(valeur);
  if (t.includes('@')) {
    const [avant, apres] = t.split('@');
    return `${avant.slice(0, 2)}•••@${apres}`;
  }
  return `${t.slice(0, 4)} •• •• ••`;
}

export default function Acheteurs() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [recherche, setRecherche] = useState('');
  const [visibles, setVisibles] = useState({});

  useEffect(() => {
    let vivant = true;
    chargerAcheteurs()
      .then((r) => { if (vivant) setReel(r); })
      .catch((e) => { if (vivant) setSouci(String(e?.message || e)); });
    return () => { vivant = false; };
  }, []);

  const tous = (reel && reel.acheteurs) || [];

  const filtres = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    if (!t) return tous;
    return tous.filter((a) =>
      [a.nom, a.activite, a.pays].filter(Boolean).join(' ').toLowerCase().includes(t));
  }, [tous, recherche]);

  const c = (reel && reel.compte) || {};
  const pays = Object.entries(c.parPays || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nom, n]) => `${nom} (${n})`)
    .join(', ') || '—';

  const stats = [
    { libelle: 'Acheteurs inscrits', valeur: c.total ?? '—' },
    { libelle: 'Nouveaux (7 j)', valeur: c.nouveaux_7j ?? '—' },
    { libelle: 'Principaux pays', valeur: pays },
    { libelle: 'Demandes envoyées', valeur: '—' },
  ];

  const texteBandeau = reel
    ? resumeSources({ acheteurs: 'reel' })
    : (souci
      ? `Lecture de la liste des acheteurs impossible (${souci}) — cette liste est réservée à un compte administrateur connecté.`
      : 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — acheteurs" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Acheteurs</h2>
          <p className="loo-esp-hero-resume">
            Les acheteurs inscrits, lus dans la base par la fonction réservée à
            l'administration. Coordonnées masquées par défaut.
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

        <input
          className="loo-esp-champ"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par nom, activité ou pays"
        />

        <p className="loo-esp-titre">
          {filtres.length} acheteur{filtres.length > 1 ? 's' : ''}
        </p>

        {souci && <p className="loo-esp-note">La base n'a pas répondu : {souci}.</p>}
        {!reel && !souci && <p className="loo-esp-note">Lecture de la base en cours…</p>}

        {reel && filtres.length === 0 && (
          <p className="loo-esp-note">
            {tous.length === 0
              ? 'Aucun acheteur inscrit dans la base.'
              : 'Aucun acheteur ne correspond à la recherche.'}
          </p>
        )}

        <div className="loo-esp-liste">
          {filtres.map((a) => (
            <div className="loo-esp-item" key={a.id}>
              <span className="loo-esp-item-ic">{a.nom ? a.nom.charAt(0).toUpperCase() : '👤'}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{a.nom || '(sans nom)'}</b>
                <span className="loo-esp-item-l">
                  {a.activite || 'activité non précisée'}
                  {a.pays ? ` · ${a.pays}` : ''}
                  {a.inscription ? ` · inscrit ${ilYA(a.inscription)}` : ''}
                </span>
                <span className="loo-esp-item-l">
                  {visibles[a.id] ? (a.telephone || '—') : masquer(a.telephone)}
                  {' · '}
                  {visibles[a.id] ? (a.email || '—') : masquer(a.email)}
                </span>
              </span>
              <button
                type="button"
                className="loo-esp-bascule-btn"
                onClick={() => setVisibles((v) => ({ ...v, [a.id]: !v[a.id] }))}
              >
                {visibles[a.id] ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          ))}
        </div>

        <p className="loo-esp-note">
          « Demandes envoyées » n'est pas affiché : le nombre de demandes par acheteur se
          lit dans la table des conversations, pas dans la fiche de l'acheteur. Il le sera
          sur l'écran Conversations.
        </p>
      </div>
    </div>
  );
}
