import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Check, ChevronDown, ChevronUp, ExternalLink, Lock, Search, Store, X,
} from 'lucide-react';
import {
  changerStatut, recupererFournisseurs, recupererStats, recupererStatsBoutiques,
} from '../api/admin.js';
import { DONNEES_FICTIVES, TEXTE_RAPPEL } from '../api/donnees-fictives.js';
import { useSessionAdmin } from '../hooks/useSessionAdmin.js';
import CarteFournisseurAdmin from '../components/CarteFournisseurAdmin.jsx';
import NavAdmin from '../components/NavAdmin.jsx';

const ONGLETS = [
  { cle: 'en_attente', libelle: 'En attente' },
  { cle: 'publie', libelle: 'Publiés' },
  { cle: 'suspendu', libelle: 'Suspendus' },
];

const METRIQUES = ['Revenu', 'GMV', 'Fournisseurs', 'Acheteurs'];
const PERIODES = ['7 derniers jours', '30 derniers jours', '12 derniers mois'];

const D = DONNEES_FICTIVES;

function initiales(nom) {
  return (nom || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('');
}

function tempsRelatif(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const heures = Math.max(1, Math.round((Date.now() - d.getTime()) / 3600000));
  if (heures < 24) return `il y a ${heures} h`;
  return `il y a ${Math.round(heures / 24)} j`;
}

function publiable(f) {
  return f.grossiste_photo?.length > 0 && !!f.grossiste_contact?.[0]?.telephone && f.stock_confirme;
}

export default function TableauDeBord() {
  const { session, autorise } = useSessionAdmin();
  const [fournisseurs, setFournisseurs] = useState(undefined);
  const [stats, setStats] = useState(undefined);
  const [boutiques, setBoutiques] = useState(undefined);
  const [onglet, setOnglet] = useState('en_attente');
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState([]);
  const [metrique, setMetrique] = useState('Revenu');
  const [periode, setPeriode] = useState(PERIODES[2]);
  const [deplie, setDeplie] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(() => {
    recupererFournisseurs().then(setFournisseurs).catch((err) => setErreur(err.message));
    recupererStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (autorise) recharger();
  }, [autorise, recharger]);

  useEffect(() => {
    if (!autorise || !session) return;
    recupererStatsBoutiques(session.access_token).then(setBoutiques).catch(() => setBoutiques([]));
  }, [autorise, session]);

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (fournisseurs || [])
      .filter((f) => f.statut === onglet)
      .filter((f) => !q || [f.nom, f.ville, f.commune, f.categorie].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [fournisseurs, onglet, recherche]);

  const compter = useCallback(
    (statut) => (fournisseurs || []).filter((f) => f.statut === statut).length,
    [fournisseurs],
  );

  async function agirEnLot(statut) {
    setEnCours(true);
    setErreur('');
    try {
      for (const id of selection) await changerStatut(id, statut); // eslint-disable-line no-await-in-loop
      setSelection([]);
      recharger();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  }

  async function agir(id, statut) {
    setEnCours(true);
    setErreur('');
    try {
      await changerStatut(id, statut);
      recharger();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  }

  if (session === undefined || autorise === undefined) {
    return (
      <section className="section">
        <div className="container"><div className="loo-squelette" style={{ height: '220px' }} /></div>
      </section>
    );
  }
  if (autorise === false) {
    return (
      <section className="section">
        <div className="container"><p>Ce compte n'a pas les droits d'administration.</p></div>
      </section>
    );
  }

  const tousCoches = liste.length > 0 && liste.every((f) => selection.includes(f.id));
  const serie = D.ca.series[metrique];

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />

        <header className="loo-admin-tete">
          <div className="loo-admin-marque">
            <img src="/logo.jpeg" alt="" className="loo-admin-logo" />
            <div>
              <strong className="loo-admin-marque-nom">LOOHOO</strong>
              <span className="loo-admin-marque-sous">B2B Commerce</span>
            </div>
          </div>
          <div className="loo-admin-vue">Administration — Vue super-admin</div>
        </header>

        <div className="loo-admin-bandeau">
          <span className="loo-admin-bandeau-pastille">{TEXTE_RAPPEL}</span>
          <span className="loo-admin-bandeau-texte">
            Données de démonstration — <strong>aucune source réelle</strong> pour les blocs marqués{' '}
            <em>fictif</em> : rien n'est branché dessus, aucune donnée n'est lue en base pour eux.
          </span>
        </div>

        {erreur && <p className="loo-admin-erreur">{erreur}</p>}

        <div className="loo-admin-grille">
          {/* ---------------- Colonne principale ---------------- */}
          <div className="loo-admin-principal">
            <div className="loo-admin-profil">
              <div className="loo-admin-profil-tete">
                <div className="loo-admin-avatar loo-admin-avatar-grand">
                  {initiales(session?.user?.email?.split('@')[0]?.replace(/[._-]/g, ' '))}
                </div>
                <div>
                  <strong>{session?.user?.email || 'Compte administrateur'}</strong>
                  <div className="loo-admin-sous-titre">Session connectée à la base réelle</div>
                </div>
                <span className="loo-admin-badge-role">
                  <BadgeCheck size={14} /> Super-admin
                </span>
              </div>
              <div className="loo-admin-raccourcis">
                <Link className="loo-admin-raccourci" to="/fournisseurs">
                  <Store size={16} />
                  <span>Fournisseurs</span>
                  <strong>{stats ? stats.grossistes_total : '…'}</strong>
                </Link>
                <Link className="loo-admin-raccourci" to="/boutiques">
                  <Lock size={16} />
                  <span>Boutiques</span>
                  <strong>{boutiques ? boutiques.length : '…'}</strong>
                </Link>
              </div>
            </div>

            {/* ---- Santé de la plateforme : données réelles ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">Santé de la plateforme</h2>
                <span className="loo-admin-source loo-admin-source-reelle">base réelle</span>
              </div>
              <div className="loo-admin-kpis">
                {stats ? (
                  <>
                    <Kpi libelle="Fournisseurs" valeur={stats.grossistes_total} to="/fournisseurs" />
                    <Kpi libelle="Publiés" valeur={stats.grossistes_publies} to="/fournisseurs" />
                    <Kpi libelle="Vérifiés" valeur={stats.grossistes_verifies} to="/fournisseurs" />
                    <Kpi libelle="En attente" valeur={stats.grossistes_en_attente} accent to="/fournisseurs/en-attente" />
                    <Kpi libelle="Produits" valeur={stats.produits_total} />
                    <Kpi libelle="Produits en attente" valeur={stats.produits_en_attente} accent />
                    <Kpi libelle="Contacts (7 j)" valeur={stats.contacts_7_jours} />
                  </>
                ) : (
                  <div className="loo-squelette" style={{ height: '96px', gridColumn: '1 / -1' }} />
                )}
              </div>
            </section>

            {/* ---- Chiffre d'affaires : données fictives ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">Chiffre d'affaires LOOHOO</h2>
                <span className="loo-admin-source">fictif</span>
              </div>
              <article className="loo-admin-carte">
                <div className="loo-admin-ca-tete">
                  <div className="loo-admin-onglets">
                    {METRIQUES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={metrique === m ? 'loo-admin-onglet actif' : 'loo-admin-onglet'}
                        onClick={() => setMetrique(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <select className="loo-admin-select" value={periode} onChange={(e) => setPeriode(e.target.value)}>
                    {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="loo-admin-ca-valeur">
                  <strong>
                    {metrique === 'Revenu'
                      ? `${D.ca.ceMois.toLocaleString('fr-FR')} F CFA`
                      : `${serie[serie.length - 1].toLocaleString('fr-FR')} ${D.ca.unites[metrique]}`.trim()}
                  </strong>
                  <span className="loo-admin-hausse">{D.ca.variation}</span>
                  <span className="loo-admin-ca-periode">{periode}</span>
                </div>
                <Courbe points={serie} />
                <p className="loo-admin-note">
                  GMV facilité {D.ca.gmvFacilite.toLocaleString('fr-FR')} F CFA · {D.ca.partCaptee} capté.
                  Valeurs inventées : aucun calcul n'est fait sur la base.
                </p>
              </article>
            </section>

            {/* ---- Santé du réseau : données fictives ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">Santé du réseau</h2>
                <span className="loo-admin-source">fictif</span>
              </div>
              <div className="loo-admin-minis">
                {D.santeReseau.map((s) => (
                  <div key={s.libelle} className="loo-admin-mini">
                    <strong>{s.valeur}</strong>
                    <span>{s.libelle}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ---- Surveillance : mixte ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">Surveillance</h2>
                <span className="loo-admin-source loo-admin-source-reelle">base réelle</span>
              </div>
              <div className="loo-admin-minis">
                {D.surveillanceInventee.map((s) => (
                  <div key={s.libelle} className="loo-admin-mini">
                    <strong>{s.valeur}</strong>
                    <span>{s.libelle} <em className="loo-admin-tag-fictif">fictif</em></span>
                  </div>
                ))}
                <div className="loo-admin-mini">
                  <strong>{compter('suspendu')}</strong>
                  <span>Fournisseurs suspendus</span>
                </div>
                <div className="loo-admin-mini">
                  <strong>{stats ? stats.produits_en_attente : '…'}</strong>
                  <span>Produits à vérifier</span>
                </div>
              </div>
            </section>

            {/* ---- File d'action : données réelles + actions ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">File d'action</h2>
                <span className="loo-admin-source loo-admin-source-reelle">base réelle</span>
                <span className="loo-admin-compteur">{fournisseurs ? fournisseurs.length : '…'}</span>
                <Link className="loo-admin-lien" to="/fournisseurs">Voir la file complète ›</Link>
              </div>

              <article className="loo-admin-carte">
                <div className="loo-admin-file-tete">
                  <div className="loo-admin-onglets">
                    {ONGLETS.map((o) => (
                      <button
                        key={o.cle}
                        type="button"
                        className={onglet === o.cle ? 'loo-admin-onglet actif' : 'loo-admin-onglet'}
                        onClick={() => { setOnglet(o.cle); setSelection([]); }}
                      >
                        {o.libelle} {fournisseurs ? `(${compter(o.cle)})` : ''}
                      </button>
                    ))}
                  </div>
                  <label className="loo-admin-recherche">
                    <Search size={15} />
                    <input
                      type="search"
                      placeholder="Rechercher un nom, une ville, une catégorie…"
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                    />
                  </label>
                </div>

                <div className="loo-admin-lot">
                  <label className="loo-admin-case">
                    <input
                      type="checkbox"
                      checked={tousCoches}
                      onChange={() => setSelection(tousCoches ? [] : liste.map((f) => f.id))}
                    />
                    Tout sélectionner
                  </label>
                  <span className="loo-admin-lot-info">
                    {selection.length > 0 ? `${selection.length} sélectionné(s)` : 'actions groupées'}
                  </span>
                  <button
                    type="button" className="btn btn-primary loo-admin-btn"
                    disabled={enCours || selection.length === 0}
                    onClick={() => agirEnLot('publie')}
                  >
                    <Check size={15} /> Publier la sélection
                  </button>
                  <button
                    type="button" className="btn btn-outline loo-admin-btn"
                    disabled={enCours || selection.length === 0}
                    onClick={() => agirEnLot('suspendu')}
                  >
                    <X size={15} /> Suspendre la sélection
                  </button>
                </div>

                {fournisseurs === undefined && <div className="loo-squelette" style={{ height: '150px' }} />}
                {fournisseurs && liste.length === 0 && (
                  <p className="loo-admin-vide">Aucun fournisseur dans cette catégorie.</p>
                )}

                <div className="loo-admin-file">
                  {liste.map((f) => (
                    <div key={f.id} className="loo-admin-ligne">
                      <div className="loo-admin-ligne-resume">
                        <label className="loo-admin-case">
                          <input
                            type="checkbox"
                            checked={selection.includes(f.id)}
                            onChange={() => setSelection((s) => (
                              s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id]
                            ))}
                          />
                        </label>
                        <div className="loo-admin-avatar">{initiales(f.nom)}</div>
                        <div className="loo-admin-ligne-texte">
                          <strong>{f.nom}</strong>
                          <div className="loo-admin-sous-titre">
                            {[f.ville, f.commune].filter(Boolean).join(' · ')} · {f.categorie}
                            {f.date_ajout ? ` · soumis ${tempsRelatif(f.date_ajout)}` : ''}
                          </div>
                        </div>
                        {f.badge_verifie && <span className="loo-admin-badge-verifie">Vérifié</span>}
                        <div className="loo-admin-ligne-actions">
                          <button
                            type="button" className="loo-admin-rond loo-admin-rond-ok"
                            title={publiable(f) ? 'Publier' : 'Pas encore publiable : photo, contact ou stock manquant'}
                            disabled={enCours || !publiable(f) || f.statut === 'publie'}
                            onClick={() => agir(f.id, 'publie')}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button" className="loo-admin-rond loo-admin-rond-non"
                            title="Suspendre"
                            disabled={enCours || f.statut === 'suspendu'}
                            onClick={() => agir(f.id, 'suspendu')}
                          >
                            <X size={16} />
                          </button>
                          <button
                            type="button" className="loo-admin-deplier"
                            onClick={() => setDeplie(deplie === f.id ? null : f.id)}
                          >
                            {deplie === f.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Détail
                          </button>
                        </div>
                      </div>
                      {deplie === f.id && (
                        <div className="loo-admin-ligne-detail">
                          <CarteFournisseurAdmin f={f} onChange={recharger} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* ---- Boutiques : données réelles ---- */}
            <section className="loo-admin-section">
              <div className="loo-admin-section-tete">
                <h2 className="loo-admin-etiquette">Boutiques</h2>
                <span className="loo-admin-source loo-admin-source-reelle">aperçu réel</span>
              </div>
              <article className="loo-admin-carte">
                <p className="loo-admin-note">
                  Chaque boutique garde sa propre interface d'administration ; cette vue est un aperçu
                  en lecture.
                </p>
                {boutiques === undefined && <div className="loo-squelette" style={{ height: '90px' }} />}
                {boutiques?.map((b) => (
                  <div key={b.id} className="loo-admin-boutique">
                    <div>
                      <strong>{b.nom}</strong>
                      {b.erreur ? (
                        <p className="loo-admin-erreur-ligne">{b.erreur}</p>
                      ) : (
                        <div className="loo-admin-boutique-stats">
                          <span>{b.nbProduits} produits en ligne</span>
                          <span>{b.nbCommandes} commandes valides</span>
                          <span>{b.chiffreAffaires.toLocaleString('fr-FR')} F CFA</span>
                        </div>
                      )}
                    </div>
                    {b.id === 'medithe' && (
                      <a href="https://medithe.looh-oo.com/admin" target="_blank" rel="noreferrer" className="btn btn-outline loo-admin-btn">
                        Ouvrir son admin <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                ))}
              </article>
            </section>
          </div>

          {/* ---------------- Colonne latérale (blocs fictifs) ---------------- */}
          <aside className="loo-admin-cote">
            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Litiges <span className="loo-admin-source">fictif</span></h3>
              <div className="loo-admin-minis loo-admin-minis-3">
                <div className="loo-admin-mini"><strong>{D.litiges.enAttente}</strong><span>En attente</span></div>
                <div className="loo-admin-mini"><strong>{D.litiges.enCours}</strong><span>En cours</span></div>
                <div className="loo-admin-mini"><strong>{D.litiges.resolus}</strong><span>Résolus (7 j)</span></div>
              </div>
              <p className="loo-admin-note">
                Par type : {D.litiges.parType.map((t) => `${t.libelle} ${t.valeur}`).join(' · ')}
              </p>
              <Link className="loo-admin-lien" to="/service-client">Ouvrir le service client &amp; litiges ›</Link>
            </article>

            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Alertes stock <span className="loo-admin-source">fictif</span></h3>
              <div className="loo-admin-minis loo-admin-minis-3">
                <div className="loo-admin-mini"><strong>{D.alertesStock.actives}</strong><span>Actives</span></div>
                <div className="loo-admin-mini"><strong>{D.alertesStock.enVerification}</strong><span>En vérification</span></div>
                <div className="loo-admin-mini"><strong>{D.alertesStock.resolues}</strong><span>Résolues (7 j)</span></div>
              </div>
              <Link className="loo-admin-lien" to="/service-client">Voir les alertes stock ›</Link>
            </article>

            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Parrainages <span className="loo-admin-source">fictif</span></h3>
              <div className="loo-admin-parrainage">
                <span className="loo-admin-sous-titre">Côté acheteurs</span>
                <div className="loo-admin-minis loo-admin-minis-3">
                  <div className="loo-admin-mini"><strong>{D.parrainages.acheteurs.enAttente}</strong><span>En attente</span></div>
                  <div className="loo-admin-mini"><strong>{D.parrainages.acheteurs.valides}</strong><span>Validés</span></div>
                  <div className="loo-admin-mini"><strong>{D.parrainages.acheteurs.filleuls}</strong><span>Filleuls</span></div>
                </div>
              </div>
              <div className="loo-admin-parrainage">
                <span className="loo-admin-sous-titre">Côté fournisseurs</span>
                <div className="loo-admin-minis loo-admin-minis-3">
                  <div className="loo-admin-mini"><strong>{D.parrainages.fournisseurs.enAttente}</strong><span>En attente</span></div>
                  <div className="loo-admin-mini"><strong>{D.parrainages.fournisseurs.valides}</strong><span>Validés</span></div>
                  <div className="loo-admin-mini"><strong>{D.parrainages.fournisseurs.filleuls}</strong><span>Filleuls</span></div>
                </div>
              </div>
            </article>

            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Journal des décisions <span className="loo-admin-source">fictif</span></h3>
              <ul className="loo-admin-journal">
                {D.journal.map((j) => (
                  <li key={j.action}>
                    <span className="loo-admin-avatar loo-admin-avatar-petit">{j.qui}</span>
                    <span>{j.action}</span>
                    <em>{j.quand}</em>
                  </li>
                ))}
              </ul>
            </article>

            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Votre équipe &amp; rôles <span className="loo-admin-source">fictif</span></h3>
              <ul className="loo-admin-equipe">
                {D.equipe.map((m) => (
                  <li key={m.nom}>
                    <span className="loo-admin-avatar loo-admin-avatar-petit">{m.initiales}</span>
                    <span>{m.nom}</span>
                    <em>{m.role}</em>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-outline loo-admin-btn" disabled>Ajouter un membre</button>
            </article>

            <article className="loo-admin-carte">
              <h3 className="loo-admin-carte-titre">Historique de connexion <span className="loo-admin-source">fictif</span></h3>
              <ul className="loo-admin-equipe">
                {D.connexions.map((c) => (
                  <li key={`${c.qui}-${c.plage}`}>
                    <span className="loo-admin-avatar loo-admin-avatar-petit">{initiales(c.qui)}</span>
                    <span>{c.plage}</span>
                    <em>{c.quand}</em>
                  </li>
                ))}
              </ul>
            </article>

            <article className="loo-admin-carte loo-admin-carte-route">
              <h3 className="loo-admin-carte-titre">Feuille de route LOOHOO <span className="loo-admin-source">fictif</span></h3>
              <ul className="loo-admin-route">
                {D.feuilleDeRoute.map((e) => (
                  <li key={e.libelle}>
                    <span>{e.libelle}</span>
                    <em>{e.statut}</em>
                  </li>
                ))}
              </ul>
            </article>

            <article className="loo-admin-carte loo-admin-carte-route">
              <h3 className="loo-admin-carte-titre">Aperçu — espace modérateur <span className="loo-admin-source">fictif</span></h3>
              <p className="loo-admin-apercu-titre">{D.apercu.titre}</p>
              <p className="loo-admin-note">{D.apercu.texte}</p>
              <Link className="loo-admin-lien" to="/moderateur">Ouvrir l’espace modérateur ›</Link>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({ libelle, valeur, accent, to }) {
  const classe = accent ? 'loo-admin-kpi loo-admin-kpi-accent' : 'loo-admin-kpi';
  const contenu = (
    <>
      <strong>{valeur}</strong>
      <span>{libelle}</span>
    </>
  );
  if (to) {
    return (
      <Link className={classe} to={to}>
        {contenu}
      </Link>
    );
  }
  return <div className={classe}>{contenu}</div>;
}

// Courbe du chiffre d'affaires : dessin d'après les valeurs reçues, aucune donnée lue.
function Courbe({ points }) {
  const largeur = 620;
  const hauteur = 170;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const etendue = max - min || 1;
  const pas = largeur / (points.length - 1);
  const coords = points.map((v, i) => [i * pas, hauteur - ((v - min) / etendue) * (hauteur - 34) - 17]);
  const ligne = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const aire = `${ligne} L${largeur},${hauteur} L0,${hauteur} Z`;

  return (
    <svg className="loo-admin-courbe" viewBox={`0 0 ${largeur} ${hauteur}`} preserveAspectRatio="none" role="img" aria-label="Courbe">
      <defs>
        <linearGradient id="loo-admin-degrade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--loo-orange)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--loo-orange)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={aire} fill="url(#loo-admin-degrade)" />
      <path d={ligne} fill="none" stroke="var(--loo-rouge)" strokeWidth="2.5" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={points[i]} cx={x} cy={y} r="3" fill="var(--loo-blanc)" stroke="var(--loo-rouge)" strokeWidth="2" />
      ))}
    </svg>
  );
}
