import React, { useEffect, useMemo, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerProduits, verifierStockProduit, resumeSources, ilYA } from '../api/loohoo.js';

/*
  ÉCRAN « PRODUITS » — onglet du module Fournisseurs (maquette n02).

  Source : table `produit`, lisible publiquement. Chaque ligne affichée vient de la
  base : nom, catégorie, sous-catégorie, prix de gros, quantité minimum (moq),
  stock, date de dernière mise à jour, fournisseur. Aucun chiffre n'est inventé.

  Ce que la base ne contient pas : le nombre de vues par produit est global
  (table `visite`, par fournisseur), pas par produit — l'écran ne l'affiche pas.
*/

const FILTRES = [
  { cle: '', libelle: 'Tous' },
  { cle: 'publie', libelle: 'Publiés' },
  { cle: 'en_attente', libelle: 'En attente' },
  { cle: 'rejete', libelle: 'Rejetés' },
];

const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

const ETIQUETTE = {
  publie: 'publié',
  en_attente: 'en attente',
  rejete: 'rejeté',
  brouillon: 'brouillon',
};

function classeStatut(statut) {
  if (statut === 'publie') return 'ok';
  if (statut === 'rejete') return 'alerte';
  return 'attente';
}

export default function Produits() {
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [message, setMessage] = useState('');

  const charger = () => {
    setReel(null);
    chargerProduits({ statut })
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(() => {
    let vivant = true;
    setReel(null);
    setSouci('');
    chargerProduits({ statut })
      .then((r) => { if (vivant) setReel(r); })
      .catch((e) => { if (vivant) setSouci(String(e?.message || e)); });
    return () => { vivant = false; };
  }, [statut]);

  const tous = (reel && reel.produits) || [];

  const filtres = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    if (!t) return tous;
    return tous.filter((p) =>
      [p.nom, p.categorie, p.sous_categorie, p.fournisseur?.nom, p.sku]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(t));
  }, [tous, recherche]);

  const c = (reel && reel.compte) || {};

  const stats = [
    { libelle: 'Produits publiés', valeur: c.publies ?? '—' },
    { libelle: 'En attente de validation', valeur: c.en_attente ?? '—' },
    { libelle: 'Rejetés', valeur: c.rejetes ?? '—' },
    { libelle: 'Stock non vérifié', valeur: c.stock_non_verifie ?? '—' },
  ];

  const texteBandeau = reel
    ? resumeSources({ produits: 'reel', fournisseurs: 'reel' })
    : (souci ? `Lecture de la base impossible (${souci}).` : 'Lecture de la base en cours…');

  async function verifier(produit) {
    setMessage('');
    try {
      await verifierStockProduit(produit.id, true);
      setMessage(`Stock de « ${produit.nom} » marqué comme vérifié par l'équipe.`);
      charger();
    } catch (e) {
      setMessage(`Vérification refusée : ${String(e?.message || e)}. Cette action demande un compte administrateur connecté.`);
    }
  }

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — produits" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Produits</h2>
          <p className="loo-esp-hero-resume">
            Le catalogue des fournisseurs, lu directement dans la base. Un produit publié dont
            le stock n'a jamais été vérifié par l'équipe reste signalé ici.
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
          {FILTRES.map((f) => (
            <button
              type="button"
              key={f.cle || 'tous'}
              className={`loo-esp-bascule-btn${statut === f.cle ? ' actif' : ''}`}
              onClick={() => setStatut(f.cle)}
            >
              {f.libelle}
            </button>
          ))}
        </div>

        <input
          className="loo-esp-champ"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par nom, catégorie ou fournisseur"
        />

        <p className="loo-esp-titre">
          {filtres.length} produit{filtres.length > 1 ? 's' : ''}
          {statut ? ` — ${ETIQUETTE[statut] || statut}` : ''}
        </p>

        {message && <p className="loo-esp-note">{message}</p>}
        {!reel && !souci && <p className="loo-esp-note">Lecture de la base en cours…</p>}
        {souci && <p className="loo-esp-note">La base n'a pas répondu : {souci}.</p>}

        {reel && filtres.length === 0 && (
          <p className="loo-esp-note">
            {tous.length === 0
              ? 'Aucun produit dans la base pour ce filtre.'
              : 'Aucun produit ne correspond à la recherche.'}
          </p>
        )}

        <div className="loo-esp-liste">
          {filtres.map((p) => (
            <div className="loo-esp-item" key={p.id}>
              <span className={`loo-esp-item-ic ${classeStatut(p.statut)}`}>
                {p.statut === 'publie' ? '📦' : p.statut === 'rejete' ? '⛔' : '⏳'}
              </span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{p.nom || '(sans nom)'}</b>
                <span className="loo-esp-item-l">
                  {[p.categorie, p.sous_categorie].filter(Boolean).join(' › ') || 'sans catégorie'}
                  {p.fournisseur?.nom ? ` · ${p.fournisseur.nom}` : ''}
                  {p.fournisseur?.ville ? ` (${p.fournisseur.ville})` : ''}
                </span>
                <span className="loo-esp-item-l">
                  {fcfa(p.prix_gros_fcfa)}
                  {p.prix_unitaire_fcfa ? ` · détail ${fcfa(p.prix_unitaire_fcfa)}` : ''}
                  {p.moq ? ` · minimum ${p.moq}${p.unite ? ` ${p.unite}` : ''}` : ''}
                  {p.stock_disponible != null ? ` · stock ${p.stock_disponible}` : ''}
                </span>
                <span className="loo-esp-item-l">
                  {p.stock_verifie_le
                    ? `Stock vérifié ${ilYA(p.stock_verifie_le)}`
                    : 'Stock jamais vérifié'}
                  {p.stock_maj_le ? ` · mis à jour ${ilYA(p.stock_maj_le)}` : ''}
                  {p.date_ajout ? ` · ajouté ${ilYA(p.date_ajout)}` : ''}
                </span>
                {p.statut === 'rejete' && p.motif_rejet && (
                  <span className="loo-esp-item-l">Motif du rejet : {p.motif_rejet}</span>
                )}
              </span>
              <span className="loo-esp-item-tag">{ETIQUETTE[p.statut] || p.statut || '—'}</span>
              {!p.stock_verifie_le && p.statut === 'publie' && (
                <button type="button" className="loo-esp-bascule-btn" onClick={() => verifier(p)}>
                  Vérifier le stock
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="loo-esp-note">
          Les vues par produit n'existent pas en base (les visites sont comptées par
          fournisseur) : ce chiffre n'est donc pas affiché plutôt qu'estimé.
        </p>
      </div>
    </div>
  );
}
