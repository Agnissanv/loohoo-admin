import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { DONNEES_ESPACES, SANS_SOURCE } from '../api/donnees-espaces.js';
import { chargerServiceClient, trancherAffaire, resumeSources } from '../api/loohoo.js';
import { suivreSession } from '../api/admin.js';

/*
  ÉCRAN n04 — SERVICE CLIENT & LITIGES (persona « Marie C. »).
  Deux espaces dans le même écran : Litiges / Call center (bascule).

  Branché sur la base LOOHOO :
  - litiges = affaires `contestee` / `proposee` (+ leur conversation et leurs médias) ;
  - « Note 1★ » = avis notés 1 ou 2 dans la table `avis` ;
  - alertes stock = produits dont le stock n'est pas vérifié (`produit.stock_verifie_le`) ;
  - vos décisions = journal d'audit ;
  - arbitrage = fonction serveur `admin_trancher_affaire` (confirmer / annuler).
  Sans source (le bloc le dit) : type de litige, relances automatiques du call center.
*/
export default function ServiceClientLitiges() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [session, setSession] = useState(null);
  const [espace, setEspace] = useState('litiges');
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState('');
  const [journeeValidee, setJourneeValidee] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const charger = () => {
    chargerServiceClient()
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(charger, []);
  useEffect(() => suivreSession(setSession), []);

  const d = { ...DONNEES_ESPACES.serviceClient, ...(reel || {}) };
  const litige = d.litige;
  const courriel = session?.user?.email || '';
  const nomAgent = courriel ? courriel.split('@')[0] : 'service client';
  const dateJour = d.journee?.date || new Date().toLocaleDateString('fr-FR');

  async function decider(statut) {
    if (!litige?.id) return;
    setEnCours(true);
    setSouci('');
    try {
      await trancherAffaire(litige.id, statut, statut === 'confirmee' ? litige.montant : null);
      setDecision(statut === 'confirmee' ? 'Marquer résolu' : 'Annuler l’affaire');
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
        <EnTeteAdmin vue={`Service client & litiges — vue ${nomAgent}`} />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Bonjour {nomAgent}</h2>
          <p className="loo-esp-hero-resume">{d.hero?.resume}</p>
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
              <span>Actions aujourd’hui</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee?.hier ?? 0}</b>
              <span>Actions hier</span>
            </div>
            <div className="loo-esp-journee-stat">
              <b>{d.journee?.semaine ?? 0}</b>
              <span>Cette semaine</span>
            </div>
          </div>
          {journeeValidee ? (
            <p className="loo-esp-sous">✓ Journée validée — vos décisions sont déjà dans le journal d’audit.</p>
          ) : (
            <button type="button" className="loo-esp-btn-plein" onClick={() => setJourneeValidee(true)}>
              ✓ Valider ma journée
            </button>
          )}
          <p className="loo-esp-sous">
            Litiges et relances confondus : chaque arbitrage est enregistré à votre nom
            dans le journal d’audit et remonte au super-admin.
          </p>
        </section>

        <div className="loo-esp-bascule">
          <button
            type="button"
            className={`loo-esp-bascule-btn${espace === 'litiges' ? ' actif' : ''}`}
            onClick={() => setEspace('litiges')}
          >
            ⚖️ Litiges
          </button>
          <button
            type="button"
            className={`loo-esp-bascule-btn${espace === 'callcenter' ? ' actif' : ''}`}
            onClick={() => setEspace('callcenter')}
          >
            📞 Call center
          </button>
        </div>

        {espace === 'litiges' ? (
          <>
            <p className="loo-esp-titre">Dossier en cours</p>
            {litige ? (
              <section className="loo-esp-sombre">
                <p className="loo-esp-sombre-titre">Litige {litige.numero}</p>
                <span className="loo-esp-tag">{litige.origine}</span>

                <div className="loo-esp-vs">
                  <div className="loo-esp-vs-partie">
                    <p>Acheteur</p>
                    <b>{litige.acheteur?.nom}</b>
                    <p>{litige.acheteur?.meta}</p>
                  </div>
                  <span className="loo-esp-vs-sep">VS</span>
                  <div className="loo-esp-vs-partie">
                    <p>Fournisseur</p>
                    <b>{litige.fournisseur?.nom}</b>
                    <p>{litige.fournisseur?.meta}</p>
                  </div>
                </div>

                <div className="loo-esp-info">
                  <span>Montant déclaré</span>
                  <span>{Number(litige.montant || 0).toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="loo-esp-fil">
                  {litige.fil?.length ? litige.fil.map((m, i) => (
                    <p key={`${m.de}-${i}`}>
                      <strong>{m.de} :</strong> {m.texte}
                    </p>
                  )) : <p>Aucun message dans cette conversation.</p>}
                </div>
                <span className="loo-esp-lien loo-esp-lien-inactif">
                  📎 {litige.preuves} preuve(s) jointe(s) au dossier du fournisseur
                </span>

                <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>Type de litige</p>
                <div className="loo-esp-actions">
                  {(litige.types || []).map((t) => (
                    <button key={t} type="button" className="loo-esp-btn loo-esp-btn-choix" disabled>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="loo-esp-note">{SANS_SOURCE} : l’affaire ne porte pas de type de litige.</p>

                <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>Note de résolution</p>
                <input
                  className="loo-esp-champ"
                  placeholder="Ex. remboursement partiel accordé à l’acheteur"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                {decision ? (
                  <p className="loo-esp-note">
                    Décision « {decision} » — enregistrée sur l’affaire et journalisée.
                  </p>
                ) : (
                  <div className="loo-esp-actions">
                    <button type="button" className="loo-esp-btn" disabled={enCours} onClick={() => decider('annulee')}>
                      {enCours ? 'Enregistrement…' : 'Annuler l’affaire'}
                    </button>
                    <button type="button" className="loo-esp-btn loo-esp-btn-ok" disabled={enCours} onClick={() => decider('confirmee')}>
                      ✓ Marquer résolu
                    </button>
                  </div>
                )}
                <p className="loo-esp-note">
                  Confirmer une affaire crée la commission due par le fournisseur ; annuler la retire.
                  L’escalade vers le super-admin n’existe pas encore côté base.
                </p>
              </section>
            ) : (
              <p className="loo-esp-note">Aucun litige en attente dans la base.</p>
            )}

            {souci && reel ? <p className="loo-esp-note">{souci}</p> : null}

            <p className="loo-esp-titre">File d’attente litiges ({(d.fileLitiges || []).length})</p>
            <div className="loo-esp-liste">
              {(d.fileLitiges || []).map((l) => (
                <button type="button" className="loo-esp-item" key={`${l.nom}-${l.libelle}`}>
                  <span className="loo-esp-item-ic alerte">{l.icone}</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">{l.nom}</b>
                    <span className="loo-esp-item-l">{l.libelle}</span>
                  </span>
                  <span className="loo-esp-item-tag">{l.tag}</span>
                  <span className="loo-esp-chevron">›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="loo-esp-titre">Alertes stock à relancer</p>
            <div className="loo-esp-liste">
              {(d.alertesStock || []).length === 0 ? (
                <p className="loo-esp-note">Aucun produit en attente de vérification de stock.</p>
              ) : null}
              {(d.alertesStock || []).map((l) => (
                <button type="button" className="loo-esp-item" key={`${l.nom}-${l.libelle}`}>
                  <span className={`loo-esp-item-ic${l.urgent ? ' alerte' : ''}`}>{l.icone}</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">{l.nom}</b>
                    <span className={`loo-esp-item-l${l.urgent ? ' urgent' : ''}`}>{l.libelle}</span>
                  </span>
                  <span className="loo-esp-chevron">›</span>
                </button>
              ))}
            </div>
            <p className="loo-esp-note">
              Les relances automatiques (« relancé hier ») n’existent pas côté code : {SANS_SOURCE}.
            </p>
          </>
        )}

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
