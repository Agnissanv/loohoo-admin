import React, { useEffect, useMemo, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerRecherchesVides, resumeSources, ilYA } from '../api/loohoo.js';

/*
  ÉCRAN « DEMANDES NON COUVERTES » — priorité haute de la spec (v3, point 6).

  Source : table recherche_sans_resultat, remplie par le site à chaque recherche
  qui ne trouve aucun produit (terme, catégorie, ville, date — rien de personnel).
  L'admin lit la synthèse avec admin_recherches_vides(p_jours) : les demandes les
  plus fréquentes sur la période, avec leur nombre et la date de la dernière.

  À quoi ça sert : c'est la liste des catégories et des villes où il manque des
  fournisseurs. Chaque ligne est une piste de recrutement, pas une statistique.

  Aucun chiffre n'est inventé : si la base ne répond pas, l'écran le dit.
*/

const PERIODES = [
  { jours: 7, libelle: '7 derniers jours' },
  { jours: 30, libelle: '30 derniers jours' },
  { jours: 90, libelle: '90 derniers jours' },
];

/* Regroupe les recherches sur un champ (ville ou catégorie) et somme les volumes. */
function topPar(lignes, champ, combien = 3) {
  const cumul = new Map();
  lignes.forEach((l) => {
    const cle = (l[champ] || '').trim();
    if (!cle) return;
    cumul.set(cle, (cumul.get(cle) || 0) + (l.nombre || 0));
  });
  return [...cumul.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, combien)
    .map(([nom, nombre]) => `${nom} (${nombre})`)
    .join(', ') || '—';
}

export default function DemandesNonCouvertes() {
  const [jours, setJours] = useState(30);
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    let vivant = true;
    setReel(null);
    chargerRecherchesVides(jours)
      .then((r) => { if (vivant) setReel(r); })
      .catch((e) => { if (vivant) setSouci(String(e?.message || e)); });
    return () => { vivant = false; };
  }, [jours]);

  const lignes = (reel && reel.recherches) || [];

  const filtrees = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    if (!t) return lignes;
    return lignes.filter((l) =>
      [l.terme, l.categorie, l.ville]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(t));
  }, [lignes, recherche]);

  const total = lignes.reduce((n, l) => n + (l.nombre || 0), 0);
  const frequente = lignes[0];
  const villes = topPar(lignes, 'ville');
  const categories = topPar(lignes, 'categorie');

  const texteBandeau = reel
    ? (reel.erreur
      ? `Lecture de la base impossible (${reel.erreur}) — l'écran reste vide plutôt que d'afficher un chiffre inventé.`
      : resumeSources({ 'recherches sans résultat': 'reel' }))
    : (souci
      ? `Lecture de la base impossible pour le moment (${souci}).`
      : 'Lecture de la base en cours…');

  const stats = [
    { libelle: `Recherches sans résultat (${jours} j)`, valeur: total.toLocaleString('fr-FR') },
    { libelle: 'Recherche la plus fréquente', valeur: frequente ? frequente.terme || '—' : '—' },
    { libelle: 'Catégories les plus demandées', valeur: categories },
    { libelle: 'Villes les plus demandées', valeur: villes },
  ];

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — demandes non couvertes" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Demandes non couvertes</h2>
          <p className="loo-esp-hero-resume">
            Recherches qui n'ont trouvé aucun produit. C'est la liste des catégories et des
            villes où il manque des fournisseurs : chaque ligne est une piste de recrutement.
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
          {PERIODES.map((p) => (
            <button
              type="button"
              key={p.jours}
              className={`loo-esp-bascule-btn${jours === p.jours ? ' actif' : ''}`}
              onClick={() => setJours(p.jours)}
            >
              {p.libelle}
            </button>
          ))}
        </div>

        <input
          className="loo-esp-champ"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par terme, catégorie ou ville"
        />

        <p className="loo-esp-titre">
          {filtrees.length} recherche{filtrees.length > 1 ? 's' : ''} non couverte
          {filtrees.length > 1 ? 's' : ''}
        </p>

        {!reel && <p className="loo-esp-note">Lecture de la base en cours…</p>}

        {reel && filtrees.length === 0 && (
          <p className="loo-esp-note">
            {lignes.length === 0
              ? `Aucune recherche sans résultat enregistrée sur les ${jours} derniers jours.`
              : 'Aucune recherche ne correspond au filtre.'}
          </p>
        )}

        <div className="loo-esp-liste">
          {filtrees.map((l, i) => (
            <div className="loo-esp-item" key={`${l.terme || ''}-${l.categorie || ''}-${l.ville || ''}-${i}`}>
              <span className="loo-esp-item-ic alerte">🔍</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.terme || '(sans terme)'}</b>
                <span className="loo-esp-item-l">
                  {[l.categorie, l.ville].filter(Boolean).join(' · ') || 'catégorie et ville non précisées'}
                  {l.derniere ? ` · dernière ${ilYA(l.derniere)}` : ''}
                </span>
              </span>
              <span className="loo-esp-item-tag">{l.nombre} ×</span>
            </div>
          ))}
        </div>

        <p className="loo-esp-note">
          Recrutement : ces recherches sont les fournisseurs à aller chercher en priorité —
          commencez par la catégorie et la ville les plus demandées. Seuls le terme, la
          catégorie, la ville et la date sont enregistrés (aucune donnée personnelle).
        </p>
      </div>
    </div>
  );
}
