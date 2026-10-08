import React from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import CourbeOnglets from '../components/CourbeOnglets.jsx';
import { DONNEES_ESPACES } from '../api/donnees-espaces.js';

/*
  ÉCRAN n02 — ADMINISTRATION, sous-module « Gestion des fournisseurs ».
  Attention : ce n'est PAS l'espace personnel du fournisseur (rôle fournisseur),
  c'est la vue de l'ADMIN sur les fournisseurs de la plateforme.

  Reproduit la maquette « admin vu fournisseur n02 ».
  Données fictives : src/api/donnees-espaces.js.
*/
export default function EspaceFournisseurs() {
  const d = DONNEES_ESPACES.fournisseurs;

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — sous-module Fournisseurs" />
        <BandeauFictif texte="Chiffres repris des maquettes du client — aucune donnée réelle n'est lue ni modifiée." />

        <section className="loo-esp-hero">
          <h2>{d.hero.titre}</h2>
          <p className="loo-esp-hero-resume">{d.hero.resume}</p>
          <div className="loo-esp-hero-grille">
            {d.hero.stats.map((s) => (
              <div className="loo-esp-hero-stat" key={s.libelle}>
                <b>{s.valeur}</b>
                <span>{s.libelle}</span>
              </div>
            ))}
          </div>
        </section>

        <CourbeOnglets series={d.courbe} />

        <p className="loo-esp-titre">À traiter</p>
        <div className="loo-esp-liste">
          {d.aTraiter.map((l) => (
            <button type="button" className="loo-esp-item" key={l.libelle}>
              <span className="loo-esp-item-ic alerte">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className="loo-esp-item-l">{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </button>
          ))}
        </div>

        <p className="loo-esp-titre">Aperçu rapide</p>
        <div className="loo-esp-liste">
          {d.apercu.map((l) => (
            <button type="button" className="loo-esp-item" key={l.libelle}>
              <span className="loo-esp-item-ic">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className="loo-esp-item-l">{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </button>
          ))}
        </div>

        <p className="loo-admin-note">{d.note}</p>
      </div>
    </div>
  );
}
