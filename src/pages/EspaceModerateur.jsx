import React, { useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { DONNEES_ESPACES } from '../api/donnees-espaces.js';

/*
  ÉCRAN n03 — Espace MODÉRATEUR (persona « Anno »).
  Reproduit la maquette « admin modérateur n03 ».
  Les actions (valider / rejeter / valider ma journée) n'écrivent rien : elles
  ne font que basculer l'affichage local. Aucune source réelle branchée.
*/
export default function EspaceModerateur() {
  const d = DONNEES_ESPACES.moderateur;
  const [journeeValidee, setJourneeValidee] = useState(false);
  const [motif, setMotif] = useState('');
  const [dossierTraite, setDossierTraite] = useState('');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue={`Espace modérateur — vue ${d.persona.nom} (démo)`} />
        <BandeauFictif
          texte={`Exemple d'écran modérateur : ${d.persona.enAttente} dossiers en attente. Aucune donnée réelle n'est lue ni modifiée.`}
        />

        <section className="loo-esp-hero">
          <h2>Bonjour {d.persona.nom}</h2>
          <p className="loo-esp-hero-resume">
            Connecté depuis {d.persona.depuis} · {d.persona.enAttente} dossiers en attente
          </p>
          <div className="loo-esp-hero-grille">
            {d.hero.stats.map((s) => (
              <div className="loo-esp-hero-stat" key={s.libelle}>
                <b>{s.valeur}</b>
                <span>{s.libelle}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="loo-esp-journee">
          <div className="loo-esp-journee-tete">
            <b>Votre journée</b>
            <span>{d.journee.date}</span>
          </div>
          <div className="loo-esp-journee-grille">
            <div className="loo-esp-journee-stat">
              <b>{d.journee.aujourdhui}</b>
              <span>Dossiers traités aujourd’hui</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee.hier}</b>
              <span>Traités hier</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee.semaine}</b>
              <span>Cette semaine</span>
            </div>
          </div>
          {journeeValidee ? (
            <p className="loo-esp-sous">
              ✓ Journée validée — elle remonte chez le super-admin comme rapport de travail.
            </p>
          ) : (
            <button type="button" className="loo-esp-btn-plein" onClick={() => setJourneeValidee(true)}>
              ✓ Valider ma journée
            </button>
          )}
          <p className="loo-esp-sous">
            Une fois validée, votre journée remonte automatiquement chez le super-admin
            comme rapport de travail — plus besoin de le rédiger à part.
          </p>
        </section>

        <p className="loo-esp-titre">Dossier en cours</p>
        <section className="loo-esp-sombre">
          <p className="loo-esp-sombre-titre">Dossier ouvert</p>
          <span className="loo-esp-tag">{d.dossier.resoumission}</span>
          <p className="loo-esp-sombre-nom">{d.dossier.nom}</p>

          <div className="loo-esp-docs">
            {d.dossier.documents.map((doc) => (
              <div className="loo-esp-doc" key={doc}>{doc}</div>
            ))}
          </div>

          {d.dossier.infos.map((info) => (
            <div className="loo-esp-info" key={info.libelle}>
              <span>{info.libelle}</span>
              <span>{info.valeur}</span>
            </div>
          ))}
          <a className="loo-esp-lien" href="#contact">✉ Contacter le commercial</a>

          <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>
            Checklist de vérification
          </p>
          <div className="loo-esp-checklist">
            {d.dossier.checklist.map((c) => (
              <span className="loo-esp-case" key={c.libelle}>
                <i className={c.fait ? 'fait' : ''}>{c.fait ? '✓' : ''}</i>
                {c.libelle}
              </span>
            ))}
          </div>

          <p className="loo-esp-sombre-titre">Motif (si rejet)</p>
          <input
            className="loo-esp-champ"
            placeholder="Ex. photo du stock peu claire"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />

          {dossierTraite ? (
            <p className="loo-esp-note">Dossier « {dossierTraite} » — action simulée, rien n’a été enregistré.</p>
          ) : (
            <div className="loo-esp-actions">
              <button type="button" className="loo-esp-btn" onClick={() => setDossierTraite('Rejeter')}>
                Rejeter
              </button>
              <button type="button" className="loo-esp-btn loo-esp-btn-ok" onClick={() => setDossierTraite('Valider')}>
                ✓ Valider
              </button>
            </div>
          )}
        </section>

        <p className="loo-esp-titre">File d’attente</p>
        <div className="loo-esp-liste">
          {d.file.map((l) => (
            <button type="button" className="loo-esp-item" key={l.libelle}>
              <span className="loo-esp-item-ic alerte">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className={`loo-esp-item-l${l.urgent ? ' urgent' : ''}`}>{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </button>
          ))}
        </div>

        <p className="loo-esp-titre">Fournisseurs publiés</p>
        <div className="loo-esp-liste">
          <button type="button" className="loo-esp-item">
            <span className="loo-esp-item-ic">🏭</span>
            <span className="loo-esp-item-txt">
              <b className="loo-esp-item-n">{d.publies.valeur}</b>
              <span className="loo-esp-item-l">{d.publies.libelle}</span>
            </span>
            <span className="loo-esp-chevron">›</span>
          </button>
        </div>

        <p className="loo-esp-titre">Vos commerciaux</p>
        <div className="loo-esp-liste">
          <button type="button" className="loo-esp-item">
            <span className="loo-esp-item-ic">👥</span>
            <span className="loo-esp-item-txt">
              <b className="loo-esp-item-n">{d.commerciaux.valeur}</b>
              <span className="loo-esp-item-l">{d.commerciaux.libelle}</span>
            </span>
            <span className="loo-esp-chevron">›</span>
          </button>
        </div>

        <p className="loo-admin-note">{d.note}</p>

        <div className="loo-esp-route">
          <span>🚀</span>
          <span>{DONNEES_ESPACES.roadmap.texte}</span>
          <span className="loo-esp-route-annee">{DONNEES_ESPACES.roadmap.annee}</span>
        </div>
      </div>
    </div>
  );
}
