import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { DONNEES_ESPACES } from '../api/donnees-espaces.js';

/*
  ÉCRAN — File de validation des fournisseurs (/fournisseurs/en-attente)

  C'est la page que doit ouvrir la section « 🏭 6 Fournisseurs à valider »
  de l'espace Fournisseurs, et « 6 Fournisseurs à vérifier » chez le modérateur.

  Un dossier se déplie sur place : pièces, checklist, motif de rejet, décision.
  Les décisions n'enregistrent rien (aucune table réelle branchée) : elles
  basculent seulement l'affichage et le compteur de la file.
*/
export default function FileValidation() {
  const d = DONNEES_ESPACES.validation;
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState(null);
  const [traites, setTraites] = useState({});
  const [motif, setMotif] = useState('');

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return d.dossiers.filter(
      (f) => !q || [f.nom, f.pays, f.categorie].filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [d.dossiers, recherche]);

  const restants = d.dossiers.length - Object.keys(traites).length;

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="File de validation des fournisseurs (démo)" />
        <BandeauFictif
          texte={`Exemple d'écran : ${d.dossiers.length} dossiers en attente. Aucune donnée réelle n'est lue ni modifiée.`}
        />

        <section className="loo-esp-hero">
          <h2>{d.titre}</h2>
          <p className="loo-esp-hero-resume">
            {d.resume} {restants} restant{restants > 1 ? 's' : ''} à traiter.
          </p>
          <div className="loo-esp-hero-grille">
            <div className="loo-esp-hero-stat">
              <b>{d.dossiers.length}</b>
              <span>Dossiers en attente</span>
            </div>
            {DONNEES_ESPACES.moderateur.hero.stats.map((s) => (
              <div className="loo-esp-hero-stat" key={s.libelle}>
                <b>{s.valeur}</b>
                <span>{s.libelle}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="loo-esp-titre">Rechercher un dossier</p>
        <div className="loo-esp-recherche">
          <Search size={16} />
          <input
            className="loo-esp-champ"
            placeholder="Nom, pays ou catégorie"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        <p className="loo-esp-titre">
          Dossiers en attente ({liste.length})
        </p>
        <div className="loo-esp-liste">
          {liste.map((f) => {
            const decision = traites[f.nom];
            const estOuvert = ouvert === f.nom;
            return (
              <div className="loo-esp-bloc" key={f.nom}>
                <button
                  type="button"
                  className="loo-esp-item"
                  onClick={() => setOuvert(estOuvert ? null : f.nom)}
                >
                  <span className="loo-esp-item-ic">{estOuvert ? '▾' : '▸'}</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">
                      {f.nom}
                      {f.resoumission ? <i className="loo-esp-item-tag">↻ resoumis</i> : null}
                    </b>
                    <span className="loo-esp-item-l">
                      {f.categorie} · {f.pays} · {f.soumis} · recruté par {f.recrutePar}
                    </span>
                  </span>
                  {decision ? <span className="loo-esp-item-tag">{decision}</span> : null}
                </button>

                {estOuvert ? (
                  <div className="loo-esp-sombre">
                    <p className="loo-esp-sombre-titre">Dossier {f.nom}</p>
                    <div className="loo-esp-docs">
                      {['🪪', '📦', '🏬'].map((doc) => (
                        <div className="loo-esp-doc" key={doc}>{doc}</div>
                      ))}
                    </div>
                    <div className="loo-esp-info">
                      <span>Pays</span>
                      <span>{f.pays}</span>
                    </div>
                    <div className="loo-esp-info">
                      <span>Catégorie</span>
                      <span>{f.categorie}</span>
                    </div>
                    <div className="loo-esp-info">
                      <span>Recruté par</span>
                      <span>{f.recrutePar}</span>
                    </div>
                    <div className="loo-esp-info">
                      <span>Soumis</span>
                      <span>{f.soumis}</span>
                    </div>

                    <p className="loo-esp-sombre-titre">Motif (si rejet)</p>
                    <input
                      className="loo-esp-champ"
                      placeholder="Ex. photo du stock peu claire"
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    />

                    {decision ? (
                      <p className="loo-esp-note">
                        Dossier « {f.nom} » — {decision.toLowerCase()} (simulation, rien n’est enregistré).
                      </p>
                    ) : (
                      <div className="loo-esp-actions">
                        <button
                          type="button"
                          className="loo-esp-btn"
                          onClick={() => setTraites((t) => ({ ...t, [f.nom]: 'Rejeté' }))}
                        >
                          Rejeter
                        </button>
                        <button
                          type="button"
                          className="loo-esp-btn loo-esp-btn-ok"
                          onClick={() => setTraites((t) => ({ ...t, [f.nom]: 'Validé' }))}
                        >
                          ✓ Valider
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="loo-admin-note">{d.note}</p>

        <div className="loo-esp-route">
          <span>🏭</span>
          <span>Retour à l’espace fournisseurs</span>
          <span className="loo-esp-route-annee">
            <Link className="loo-esp-lien" to="/fournisseurs">Ouvrir ›</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
