import React, { useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { DONNEES_ESPACES } from '../api/donnees-espaces.js';

/*
  ÉCRAN n04 — SERVICE CLIENT & LITIGES (persona « Marie C. »).
  Deux espaces dans le même écran : Litiges / Call center (bascule).
  Reproduit la maquette « admin service client et litige n04 ».
  Aucune écriture : la décision ne fait que basculer l'affichage local.
*/
export default function ServiceClientLitiges() {
  const d = DONNEES_ESPACES.serviceClient;
  const [espace, setEspace] = useState('litiges');
  const [typeChoisi, setTypeChoisi] = useState(d.litige.types[0]);
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState('');
  const [journeeValidee, setJourneeValidee] = useState(false);

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue={`Service client & litiges — vue ${d.persona.nom} (démo)`} />
        <BandeauFictif
          texte="Exemple d'écran service client : dossier de litige et relances call center. Aucune donnée réelle n'est lue ni modifiée."
        />

        <section className="loo-esp-hero">
          <h2>Bonjour {d.persona.nom}</h2>
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
            <p className="loo-esp-sous">✓ Journée validée — elle remonte chez le super-admin comme rapport de travail.</p>
          ) : (
            <button type="button" className="loo-esp-btn-plein" onClick={() => setJourneeValidee(true)}>
              ✓ Valider ma journée
            </button>
          )}
          <p className="loo-esp-sous">
            Une fois validée, votre journée remonte automatiquement chez le super-admin
            comme rapport de travail — litiges et relances call center confondus.
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
            <section className="loo-esp-sombre">
              <p className="loo-esp-sombre-titre">Litige {d.litige.numero}</p>
              <span className="loo-esp-tag">{d.litige.origine}</span>

              <div className="loo-esp-vs">
                <div className="loo-esp-vs-partie">
                  <p>Acheteur</p>
                  <b>{d.litige.acheteur.nom}</b>
                  <p>{d.litige.acheteur.meta}</p>
                </div>
                <span className="loo-esp-vs-sep">VS</span>
                <div className="loo-esp-vs-partie">
                  <p>Fournisseur</p>
                  <b>{d.litige.fournisseur.nom}</b>
                  <p>{d.litige.fournisseur.meta}</p>
                </div>
              </div>

              <div className="loo-esp-fil">
                {d.litige.fil.map((m) => (
                  <p key={m.de}>
                    <strong>{m.de} :</strong> {m.texte}
                  </p>
                ))}
              </div>
              <a className="loo-esp-lien" href="#conversation">💬 Voir la conversation complète</a>{' '}
              <a className="loo-esp-lien" href="#preuves">📎 {d.litige.preuves} preuves jointes</a>

              <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>Type de litige</p>
              <div className="loo-esp-actions">
                {d.litige.types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`loo-esp-btn loo-esp-btn-choix${t === typeChoisi ? ' actif' : ''}`}
                    onClick={() => setTypeChoisi(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="loo-esp-sombre-titre" style={{ marginTop: '0.9rem' }}>Note de résolution</p>
              <input
                className="loo-esp-champ"
                placeholder="Ex. remboursement partiel accordé à l’acheteur"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {decision ? (
                <p className="loo-esp-note">
                  Décision « {decision} » — action simulée, rien n’a été enregistré (le type
                  retenu est « {typeChoisi} »).
                </p>
              ) : (
                <div className="loo-esp-actions">
                  <button type="button" className="loo-esp-btn" onClick={() => setDecision('Escalader')}>
                    ⤴ Escalader
                  </button>
                  <button type="button" className="loo-esp-btn loo-esp-btn-ok" onClick={() => setDecision('Marquer résolu')}>
                    ✓ Marquer résolu
                  </button>
                </div>
              )}
              <p className="loo-esp-note">
                La partie non favorisée peut contester la décision une fois.
              </p>
            </section>

            <p className="loo-esp-titre">File d’attente litiges ({d.fileLitiges.length})</p>
            <div className="loo-esp-liste">
              {d.fileLitiges.map((l) => (
                <button type="button" className="loo-esp-item" key={l.nom}>
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
              {d.alertesStock.map((l) => (
                <button type="button" className="loo-esp-item" key={l.nom}>
                  <span className={`loo-esp-item-ic${l.urgent ? ' alerte' : ''}`}>{l.icone}</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">{l.nom}</b>
                    <span className={`loo-esp-item-l${l.urgent ? ' urgent' : ''}`}>{l.libelle}</span>
                  </span>
                  <span className="loo-esp-chevron">›</span>
                </button>
              ))}
            </div>
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
