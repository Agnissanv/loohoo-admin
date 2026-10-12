import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import ItemEspace from '../components/ItemEspace.jsx';
import { DONNEES_ESPACES, SANS_SOURCE } from '../api/donnees-espaces.js';
import { chargerModerateur, deciderFournisseur, resumeSources } from '../api/loohoo.js';
import { suivreSession } from '../api/admin.js';

/*
  ÉCRAN n03 — Espace MODÉRATEUR (persona « Anno »).

  Branché sur la base LOOHOO :
  - « Votre journée » et les décisions de la semaine = journal d'audit (`journal_admin`) ;
  - dossier en cours, file d'attente, fournisseurs publiés = table `grossiste` ;
  - valider / rejeter = fonction serveur `admin_decider_fournisseur` (motif obligatoire
    pour un rejet) : la décision est enregistrée et journalisée.
  Sans source (le bloc le dit à l'écran) : commerciaux terrain, « recruté par »,
  historique de resoumission.
*/
export default function EspaceModerateur() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [session, setSession] = useState(null);
  const [journeeValidee, setJourneeValidee] = useState(false);
  const [motif, setMotif] = useState('');
  const [dossierTraite, setDossierTraite] = useState('');
  const [enCours, setEnCours] = useState(false);

  const charger = () => {
    chargerModerateur()
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(charger, []);
  useEffect(() => suivreSession(setSession), []);

  const d = { ...DONNEES_ESPACES.moderateur, ...(reel || {}) };
  const dossier = d.dossier;
  const courriel = session?.user?.email || '';
  const nomModerateur = courriel ? courriel.split('@')[0] : 'modérateur';
  const dateJour = (d.journee?.date) || new Date().toLocaleDateString('fr-FR');

  async function decider(statut) {
    if (!dossier) return;
    if (statut === 'suspendu' && !motif.trim()) {
      setSouci('Un motif est obligatoire pour rejeter un dossier.');
      return;
    }
    setEnCours(true);
    setSouci('');
    try {
      await deciderFournisseur(dossier.id, statut, statut === 'suspendu' ? motif.trim() : null);
      setDossierTraite(statut === 'publie' ? 'Validé' : 'Rejeté');
      setMotif('');
      charger();
    } catch (e) {
      setSouci(`La décision n'a pas pu être enregistrée : ${e?.message || e}`);
    } finally {
      setEnCours(false);
    }
  }

  const texteBandeau = reel
    ? resumeSources(reel.sources)
    : (souci || 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue={`Espace modérateur — vue ${nomModerateur}`} />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Bonjour {nomModerateur}</h2>
          <p className="loo-esp-hero-resume">
            {dateJour}
            {d.file ? ` · ${d.file[0]?.valeur ?? 0} dossier(s) en attente` : ''}
          </p>
          <div className="loo-esp-hero-grille">
            {(d.hero?.stats || []).map((s) => (
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
            <span>{dateJour}</span>
          </div>
          <div className="loo-esp-journee-grille">
            <div className="loo-esp-journee-stat">
              <b>{d.journee?.aujourdhui ?? 0}</b>
              <span>Décisions prises aujourd’hui</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee?.hier ?? 0}</b>
              <span>Prises hier</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee?.semaine ?? 0}</b>
              <span>Cette semaine</span>
            </div>
          </div>
          {journeeValidee ? (
            <p className="loo-esp-sous">
              ✓ Journée validée — chaque décision est déjà enregistrée dans le journal d’audit.
            </p>
          ) : (
            <button type="button" className="loo-esp-btn-plein" onClick={() => setJourneeValidee(true)}>
              ✓ Valider ma journée
            </button>
          )}
          <p className="loo-esp-sous">
            Les décisions de la journée remontent au super-admin depuis le journal d’audit
            (qui a fait quoi, quand, sur quel dossier).
          </p>
        </section>

        <p className="loo-esp-titre">Dossier en cours</p>
        {dossier ? (
          <section className="loo-esp-sombre">
            <p className="loo-esp-sombre-titre">Dossier ouvert</p>
            <span className="loo-esp-tag">{d.resoumission || SANS_SOURCE}</span>
            <p className="loo-esp-sombre-nom">{dossier.nom}</p>

            <div className="loo-esp-docs">
              {(dossier.documents || []).map((doc, i) => (
                <div className="loo-esp-doc" key={`${doc}-${i}`}>{doc}</div>
              ))}
            </div>

            {dossier.infos.map((info) => (
              <div className="loo-esp-info" key={info.libelle}>
                <span>{info.libelle}</span>
                <span>{info.valeur}</span>
              </div>
            ))}
            <span className="loo-esp-lien loo-esp-lien-inactif">✉ Contacter le commercial — {SANS_SOURCE}</span>

            <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>
              Checklist de vérification
            </p>
            <div className="loo-esp-checklist">
              {dossier.checklist.map((c) => (
                <span className="loo-esp-case" key={c.libelle}>
                  <i className={c.fait ? 'fait' : ''}>{c.fait ? '✓' : ''}</i>
                  {c.libelle}
                </span>
              ))}
            </div>

            <p className="loo-esp-sombre-titre">Motif (obligatoire pour rejeter)</p>
            <input
              className="loo-esp-champ"
              placeholder="Ex. photo du stock peu claire"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />

            {dossierTraite ? (
              <p className="loo-esp-note">
                Dossier « {dossier.nom} » — {dossierTraite.toLowerCase()} : décision enregistrée et journalisée.
              </p>
            ) : (
              <div className="loo-esp-actions">
                <button type="button" className="loo-esp-btn" disabled={enCours} onClick={() => decider('suspendu')}>
                  {enCours ? 'Enregistrement…' : 'Rejeter'}
                </button>
                <button type="button" className="loo-esp-btn loo-esp-btn-ok" disabled={enCours} onClick={() => decider('publie')}>
                  ✓ Valider
                </button>
              </div>
            )}
          </section>
        ) : (
          <p className="loo-esp-note">Aucun dossier en attente dans la base.</p>
        )}

        {souci && reel ? <p className="loo-esp-note">{souci}</p> : null}

        <p className="loo-esp-titre">File d’attente</p>
        <div className="loo-esp-liste">
          {(d.file || []).map((l) => (
            <ItemEspace key={l.libelle} to={l.to}>
              <span className="loo-esp-item-ic alerte">{l.icone}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{l.valeur}</b>
                <span className={`loo-esp-item-l${l.urgent ? ' urgent' : ''}`}>{l.libelle}</span>
              </span>
              <span className="loo-esp-chevron">›</span>
            </ItemEspace>
          ))}
        </div>

        <p className="loo-esp-titre">Fournisseurs publiés</p>
        <div className="loo-esp-liste">
          <ItemEspace to={d.publies?.to || '/fournisseurs'}>
            <span className="loo-esp-item-ic">🏭</span>
            <span className="loo-esp-item-txt">
              <b className="loo-esp-item-n">{d.publies?.valeur ?? 0}</b>
              <span className="loo-esp-item-l">{d.publies?.libelle}</span>
            </span>
            <span className="loo-esp-chevron">›</span>
          </ItemEspace>
        </div>

        <p className="loo-esp-titre">Vos commerciaux</p>
        <div className="loo-esp-liste">
          <button type="button" className="loo-esp-item" disabled>
            <span className="loo-esp-item-ic">👥</span>
            <span className="loo-esp-item-txt">
              <b className="loo-esp-item-n">—</b>
              <span className="loo-esp-item-l">{SANS_SOURCE}</span>
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
