import React, { useEffect, useState } from 'react';
import NavAdmin from '../components/NavAdmin.jsx';
import EnTeteAdmin from '../components/EnTeteAdmin.jsx';
import BandeauFictif from '../components/BandeauFictif.jsx';
import { chargerCategories, renommerCategorie, resumeSources } from '../api/loohoo.js';

/*
  ÉCRAN « CATÉGORIES » — lecture directe des tables categorie, sous_categorie et
  pays_loohoo (migrations 0013 et 0024). Le nombre de produits par catégorie est
  compté sur les produits réellement publiés, jamais estimé.

  Le renommage passe par admin_renommer_categorie : la fonction met à jour la
  catégorie partout (produits et fournisseurs). Elle demande un compte admin.

  Ce que la base ne contient pas : le nombre de fournisseurs par catégorie est
  renseigné en texte libre par les fournisseurs, il n'y a pas de lien de clé — le
  chiffre n'est donc pas affiché plutôt qu'approximé.
*/

export default function Categories() {
  const [reel, setReel] = useState(null);
  const [souci, setSouci] = useState('');
  const [message, setMessage] = useState('');
  const [nouveau, setNouveau] = useState({});

  const charger = () => {
    chargerCategories()
      .then(setReel)
      .catch((e) => setSouci(String(e?.message || e)));
  };

  useEffect(() => { charger(); }, []);

  async function renommer(categorie) {
    const cible = (nouveau[categorie.id] || '').trim();
    if (!cible) return;
    setMessage('');
    try {
      await renommerCategorie(categorie.nom, cible);
      setMessage(`Catégorie « ${categorie.nom} » renommée en « ${cible} » (produits et fournisseurs mis à jour).`);
      setNouveau((n) => ({ ...n, [categorie.id]: '' }));
      charger();
    } catch (e) {
      setMessage(`Renommage refusé : ${String(e?.message || e)}. Cette action demande un compte administrateur connecté.`);
    }
  }

  const cats = (reel && reel.categories) || [];
  const actives = cats.filter((c) => c.active).length;
  const nbSous = cats.reduce((n, c) => n + c.sous.length, 0);

  const stats = [
    { libelle: 'Catégories', valeur: reel ? cats.length : '—' },
    { libelle: 'Dont actives', valeur: reel ? actives : '—' },
    { libelle: 'Sous-catégories', valeur: reel ? nbSous : '—' },
    { libelle: 'Produits publiés', valeur: reel ? (reel.compteProduits ?? '—') : '—' },
  ];

  const texteBandeau = reel
    ? resumeSources({ catégories: 'reel', produits: 'reel' })
    : (souci ? `Lecture de la base impossible (${souci}).` : 'Lecture de la base en cours…');

  return (
    <div className="loo-admin">
      <div className="loo-admin-container">
        <NavAdmin />
        <EnTeteAdmin vue="Administration — catégories" />
        <BandeauFictif texte={texteBandeau} />

        <section className="loo-esp-hero">
          <h2>Catégories</h2>
          <p className="loo-esp-hero-resume">
            L'arbre du catalogue, lu dans la base. Le renommage d'une catégorie se
            répercute sur les produits et les fournisseurs qui l'utilisent.
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

        {message && <p className="loo-esp-note">{message}</p>}
        {!reel && !souci && <p className="loo-esp-note">Lecture de la base en cours…</p>}
        {souci && <p className="loo-esp-note">La base n'a pas répondu : {souci}.</p>}

        {reel && cats.length === 0 && (
          <p className="loo-esp-note">Aucune catégorie enregistrée dans la base.</p>
        )}

        <div className="loo-esp-liste">
          {cats.map((c) => (
            <div className="loo-esp-item" key={c.id}>
              <span className={`loo-esp-item-ic ${c.active ? 'ok' : 'attente'}`}>{c.active ? '🏷️' : '🚫'}</span>
              <span className="loo-esp-item-txt">
                <b className="loo-esp-item-n">{c.nom}</b>
                <span className="loo-esp-item-l">
                  {c.produits} produit{c.produits > 1 ? 's' : ''} publié{c.produits > 1 ? 's' : ''}
                  {c.ordre != null ? ` · ordre ${c.ordre}` : ''}
                  {c.active ? '' : ' · catégorie désactivée'}
                </span>
                <span className="loo-esp-item-l">
                  {c.sous.length
                    ? `Sous-catégories : ${c.sous.map((s) => s.nom).join(', ')}`
                    : 'Aucune sous-catégorie'}
                </span>
                <span className="loo-esp-item-l">
                  <input
                    className="loo-esp-champ"
                    type="text"
                    value={nouveau[c.id] || ''}
                    onChange={(e) => setNouveau((n) => ({ ...n, [c.id]: e.target.value }))}
                    placeholder={`Nouveau nom pour « ${c.nom} »`}
                  />
                </span>
              </span>
              <button type="button" className="loo-esp-bascule-btn" onClick={() => renommer(c)}>
                Renommer
              </button>
            </div>
          ))}
        </div>

        {reel && reel.orphelines.length > 0 && (
          <>
            <p className="loo-esp-titre">Catégories utilisées par des produits mais absentes de la table</p>
            <div className="loo-esp-liste">
              {reel.orphelines.map((nom) => (
                <div className="loo-esp-item" key={nom}>
                  <span className="loo-esp-item-ic alerte">⚠️</span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">{nom}</b>
                    <span className="loo-esp-item-l">
                      Saisie libre d'un fournisseur : à créer dans la table des catégories
                      pour que le filtre du site la reconnaisse.
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {reel && reel.pays.length > 0 && (
          <>
            <p className="loo-esp-titre">Pays desservis</p>
            <div className="loo-esp-liste">
              {reel.pays.map((p) => (
                <div className="loo-esp-item" key={p.code}>
                  <span className={`loo-esp-item-ic ${p.actif && p.dans ? 'ok' : 'attente'}`}>
                    {p.actif && p.dans ? '✅' : '⏸️'}
                  </span>
                  <span className="loo-esp-item-txt">
                    <b className="loo-esp-item-n">
                      {p.nom} <span className="loo-esp-item-l">({p.code})</span>
                    </b>
                    <span className="loo-esp-item-l">
                      {p.devise || '—'}
                      {p.indicatif ? ` · indicatif ${p.indicatif}` : ''}
                      {p.dans ? ' · dans le périmètre du site' : ' · hors périmètre'}
                      {p.actif ? ' · ouvert' : ' · pas encore ouvert'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="loo-esp-note">
              L'ouverture d'un pays se fait par la fonction admin_ouvrir_pays(code, ouvert),
              réservée au super-administrateur : cet écran lit l'état, il ne l'invente pas.
            </p>
          </>
        )}

        <p className="loo-esp-note">
          Le nombre de fournisseurs par catégorie n'est pas affiché : la catégorie d'un
          fournisseur est un texte libre, sans lien avec la table des catégories.
        </p>
      </div>
    </div>
  );
}
