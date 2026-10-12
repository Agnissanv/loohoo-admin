/*
  ⚠️  VALEURS DE REPLI — PLUS AUCUN CHIFFRE INVENTÉ  ⚠️

  Ce fichier ne contient plus de données inventées. Il ne garde que :
  1. les textes d'écran (feuille de route, aperçu modérateur) ;
  2. les valeurs de repli vides (listes vides, zéros) utilisées tant que la
     lecture de la base n'a pas répondu ;
  3. les blocs sans source, marqués « pas connecté ».

  Tout le reste vient de `src/api/loohoo.js`, qui lit la base LOOHOO
  (sources et preuves : docs/PLAN-DE-BRANCHEMENT.md).

  Blocs SANS SOURCE dans le code des trois dépôts :
  - Parrainages / filleuls  : aucune table de parrainage dans l'annuaire
  - Historique de connexion : la table `session_connexion` n'existe pas
*/

export const TEXTE_RAPPEL = 'pas connecté';

export const DONNEES_FICTIVES = {
  /* ---- Chiffre d'affaires : repli vide (lecture réelle via loohoo.js) ---- */
  ca: null,

  /* ---- Santé du réseau : repli vide ---- */
  santeReseau: [],

  /* ---- Surveillance : repli vide ---- */
  surveillanceInventee: [],

  /* ---- Litiges (affaires) : repli à zéro ---- */
  litiges: { enAttente: 0, enCours: 0, resolus: 0, parType: [] },

  /* ---- Alertes stock : repli à zéro ---- */
  alertesStock: { actives: 0, enVerification: 0, resolues: 0 },

  /* ---- Journal des décisions : repli vide ---- */
  journal: [],

  /* ---- Équipe & rôles : repli vide ---- */
  equipe: [],

  /* ---- Blocs sans source : le disent à l'écran ---- */
  parrainages: {
    sansSource: true,
    acheteurs: { enAttente: '—', valides: '—', filleuls: '—' },
    fournisseurs: { enAttente: '—', valides: '—', filleuls: '—' },
  },
  connexions: [{ qui: '—', plage: 'pas connecté — la table session_connexion n’existe pas', quand: '' }],

  /* ---- Contenu, pas des données ---- */
  feuilleDeRoute: [
    { libelle: 'Fournisseurs (sourcing)', statut: 'En ligne · Actif' },
    { libelle: 'Boutique en ligne', statut: '2027' },
    { libelle: 'Paiement intégré (Mobile Money)', statut: '2027' },
    { libelle: 'Publicité', statut: '2028' },
  ],
  apercu: {
    titre: '🚀 Prochaine étape LOOHOO',
    texte: 'Boutique en ligne — 2027',
  },
};
