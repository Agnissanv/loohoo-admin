import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import ItemEspace from '../components/ItemEspace.jsx';
import CourbeOnglets from '../components/CourbeOnglets.jsx';
import { DONNEES_ESPACES } from '../api/donnees-espaces.js';
import { chargerFournisseurs, resumeSources } from '../api/loohoo.js';

/*
  ÉCRAN n02 — ADMINISTRATION, sous-module « Gestion des fournisseurs ».
  Attention : ce n'est PAS l'espace personnel du fournisseur (rôle fournisseur),
  c'est la vue de l'ADMIN sur les fournisseurs de la plateforme.

  Données : hero, courbe et « À traiter » sont lus en direct dans la base LOOHOO
  (stats_fournisseurs, admin_tableau_de_bord, grossiste, produit, conversation).
  Le bloc « Filleuls actifs » n'a pas de source : il reste marqué « pas connecté ».
  Détail des sources : docs/PLAN-DE-BRANCHEMENT.md.
*/
export default function EspaceFournisseurs() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');

  useEffect(() => {
    let vivant = true;
    chargerFournisseurs()
      .then((r) => { if (vivant) setReel(r); })
      .catch((e) => { if (vivant) setSouci(String(e?.message || e)); });
    return () => { vivant = false; };
  }, []);

  const d = { ...DONNEES_ESPACES.fournisseurs, ...(reel || {}) };
  const hero = d.hero || { titre: 'Espace Fournisseurs', resume: '', stats: [] };
  const courbe = d.courbe || [];
  const aTraiter = d.aTraiter || [];
  const apercu = d.apercu || [];

  const texteBandeau = reel
    ? resumeSources(reel.sources)
    : (souci
      ? `Lecture de la base impossible pour le moment (${souci}). Les blocs branchés restent vides.`
      : 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — sous-module Fournisseurs" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>{hero.titre}</h2>
          <p className="loo-esp-hero-resume">{hero.resume}</p>
          <div className="loo-esp-hero-grille">
            {hero.stats.map((s) => (
              <div className="loo-esp-hero-stat" key={s.libelle}>
                <b>{s.valeur}</b>
                <span>{s.libelle}</span>
              </div>
            ))}
          </div>
        </section>

        {courbe.length > 0 && <CourbeOnglets series={courbe} />}

        <p className="loo-esp-titre">À traiter</p>
        <div className="loo-esp-liste">
          {aTraiter.map((l) => (
            <ItemEspace key={l.libelle} to={l.to}>
              <span className="loo-esp-item-ic alerte">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className="loo-esp-item-l">{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </ItemEspace>
          ))}
        </div>

        <p className="loo-esp-titre">Aperçu rapide</p>
        <div className="loo-esp-liste">
          {apercu.map((l) => (
            <ItemEspace key={l.libelle} to={l.to}>
              <span className="loo-esp-item-ic">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className="loo-esp-item-l">{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </ItemEspace>
          ))}
        </div>

        <p className="loo-admin-note">{d.note}</p>
      </div>
    </div>
  );
}
