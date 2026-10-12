import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { DONNEES_ESPACES, SANS_SOURCE } from '../api/donnees-espaces.js';
import { chargerValidation, deciderFournisseur, resumeSources } from '../api/loohoo.js';

/*
  ÉCRAN — File de validation des fournisseurs (/fournisseurs/en-attente)

  La file est lue en direct : table `grossiste` (statut « en_attente ») avec ses
  pièces (`document_fournisseur`) et ses photos (`grossiste_photo`).
  Valider / rejeter appelle la fonction serveur admin_decider_fournisseur
  (motif obligatoire pour un rejet) : la décision est réellement enregistrée
  et l'audit la journalise.
  « Recruté par » n'existe pas en base et le dit à l'écran.
*/
export default function FileValidation() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState(null);
  const [traites, setTraites] = useState({});
  const [motif, setMotif] = useState('');
  const [enCours, setEnCours] = useState('');

  const charger = () => {
    chargerValidation()
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(charger, []);

  const d = { ...DONNEES_ESPACES.validation, ...(reel || {}) };
  const dossiers = d.dossiers || [];

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return dossiers.filter(
      (f) => !q || [f.nom, f.pays, f.categorie].filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [dossiers, recherche]);

  const restants = dossiers.length - Object.keys(traites).length;

  async function decider(dossier, statut) {
    if (statut === 'suspendu' && !motif.trim()) {
      setSouci('Un motif est obligatoire pour rejeter un dossier.');
      return;
    }
    setEnCours(dossier.id);
    setSouci('');
    try {
      await deciderFournisseur(dossier.id, statut, statut === 'suspendu' ? motif.trim() : null);
      setTraites((t) => ({ ...t, [dossier.id]: statut === 'publie' ? 'Validé' : 'Rejeté' }));
      setMotif('');
      charger();
    } catch (e) {
      setSouci(`La décision n'a pas pu être enregistrée : ${e?.message || e}`);
    } finally {
      setEnCours('');
    }
  }

  const texteBandeau = reel
    ? resumeSources(reel.sources)
    : (souci || 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="File de validation des fournisseurs" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>{d.titre}</h2>
          <p className="loo-esp-hero-resume">
            {d.resume} {restants} restant{restants > 1 ? 's' : ''} à traiter.
          </p>
          <div className="loo-esp-hero-grille">
            <div className="loo-esp-hero-stat">
              <b>{dossiers.length}</b>
              <span>Dossiers en attente</span>
            </div>
            {(d.heroStats || []).map((s) => (
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
          {liste.length === 0 ? (
            <p className="loo-esp-note">Aucun fournisseur en attente de validation dans la base.</p>
          ) : null}
          {liste.map((f) => {
            const decision = traites[f.id];
            const estOuvert = ouvert === f.id;
            return (
              <div className="loo-esp-bloc" key={f.id}>
                <button
                  type="button"
                  className="loo-esp-item"
                  onClick={() => setOuvert(estOuvert ? null : f.id)}
                >
                  <span className="loo-esp-item-ic">{estOuvert ? '▾' : '▸'}</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">
                      {f.nom}
                      {f.urgent ? <i className="loo-esp-item-tag">⚠ +48 h</i> : null}
                    </b>
                    <span className="loo-esp-item-l">
                      {f.categorie} · {f.pays} · soumis {f.soumis}
                    </span>
                  </span>
                  {decision ? <span className="loo-esp-item-tag">{decision}</span> : null}
                </button>

                {estOuvert ? (
                  <div className="loo-esp-sombre">
                    <p className="loo-esp-sombre-titre">Dossier {f.nom}</p>
                    <div className="loo-esp-docs">
                      <div className="loo-esp-doc">🪪 {f.documents} pièce(s)</div>
                      <div className="loo-esp-doc">📦 {f.photos} photo(s)</div>
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
                      <span>{f.recrutePar || SANS_SOURCE}</span>
                    </div>
                    <div className="loo-esp-info">
                      <span>Soumis</span>
                      <span>{f.soumis}</span>
                    </div>

                    <p className="loo-esp-sombre-titre">Motif (obligatoire pour rejeter)</p>
                    <input
                      className="loo-esp-champ"
                      placeholder="Ex. photo du stock peu claire"
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    />

                    {decision ? (
                      <p className="loo-esp-note">
                        Dossier « {f.nom} » — {decision.toLowerCase()} : décision enregistrée et journalisée.
                      </p>
                    ) : (
                      <div className="loo-esp-actions">
                        <button
                          type="button"
                          className="loo-esp-btn"
                          disabled={enCours === f.id}
                          onClick={() => decider(f, 'suspendu')}
                        >
                          {enCours === f.id ? 'Enregistrement…' : 'Rejeter'}
                        </button>
                        <button
                          type="button"
                          className="loo-esp-btn loo-esp-btn-ok"
                          disabled={enCours === f.id}
                          onClick={() => decider(f, 'publie')}
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

        {souci && reel ? <p className="loo-esp-note">{souci}</p> : null}

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
