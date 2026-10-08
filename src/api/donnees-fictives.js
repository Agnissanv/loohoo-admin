/*
  ⚠️  DONNÉES FICTIVES — AUCUNE SOURCE RÉELLE  ⚠️

  Ce fichier ne lit RIEN : ni la base LOOHOO, ni une API, ni un fichier.
  Les valeurs ci-dessous ont été inventées pour remplir les blocs du design
  qui n'ont pas encore de source de données (chiffre d'affaires, litiges,
  alertes stock, parrainages, journal des décisions, équipe, connexions,
  feuille de route).

  Inutile de chercher une correspondance en base : il n'y en a pas.

  Le bandeau « a connecté. » affiché en haut de la page admin le rappelle à
  l'écran : ces blocs ne sont branchés sur rien.

  Blocs alimentés par de VRAIES données (base / fonctions serveur) :
  - Santé de la plateforme (stats_fournisseurs)
  - File d'action (grossiste + produit)
  - Surveillance « fournisseurs suspendus »
  - Boutiques (/api/boutiques-stats)
  - Profil connecté (session réelle)

  Quand une vraie source existera : remplacer les lectures de ce fichier par
  les appels correspondants dans src/api/admin.js, puis supprimer ce fichier.
*/

export const DONNEES_FICTIVES = {
  /* ---- Chiffre d'affaires (bloc inventé) ---- */
  ca: {
    ceMois: 612000,
    variation: '+9 %',
    gmvFacilite: 14200000,
    partCaptee: '4,3 %',
    // 12 points, du plus ancien au plus récent — inventés
    series: {
      Revenu: [380, 410, 452, 430, 495, 520, 498, 545, 560, 590, 604, 612],
      GMV: [9.1, 9.8, 10.4, 10.2, 11.3, 11.9, 11.6, 12.4, 12.9, 13.4, 13.8, 14.2],
      Fournisseurs: [268, 275, 289, 296, 301, 312, 318, 324, 331, 335, 338, 340],
      Acheteurs: [940, 985, 1032, 1078, 1105, 1140, 1168, 1196, 1214, 1240, 1262, 1280],
    },
    unites: { Revenu: 'k F CFA', GMV: 'M F CFA', Fournisseurs: '', Acheteurs: '' },
  },

  /* ---- Santé du réseau (bloc inventé) ---- */
  santeReseau: [
    { libelle: 'Rétention fournisseurs (30 jours)', valeur: '81 %' },
    { libelle: 'Délai avant 1re vente', valeur: '6 jours' },
    { libelle: 'Concentration GMV', valeur: '38 %' },
  ],

  /* ---- Surveillance (partie inventée ; le reste est réel) ---- */
  surveillanceInventee: [
    { libelle: 'Coordonnées détectées', valeur: 2 },
    { libelle: 'Demandes sans réponse', valeur: 1 },
  ],

  /* ---- Litiges (bloc inventé) ---- */
  litiges: {
    enAttente: 2,
    enCours: 1,
    resolus: 4,
    parType: [
      { libelle: 'Paiement', valeur: 1 },
      { libelle: 'Délai / stock', valeur: 2 },
      { libelle: 'Autre', valeur: 4 },
    ],
  },

  /* ---- Alertes stock (bloc inventé) ---- */
  alertesStock: { actives: 3, enVerification: 1, resolues: 5 },

  /* ---- Parrainages (bloc inventé) ---- */
  parrainages: {
    acheteurs: { enAttente: 3, valides: 9, filleuls: 23 },
    fournisseurs: { enAttente: 1, valides: 4, filleuls: 11 },
  },

  /* ---- Journal des décisions (bloc inventé) ---- */
  journal: [
    { qui: 'RG', action: 'a publié Yopougon Cosmétiques SARL', quand: 'il y a 2 h' },
    { qui: 'AN', action: 'a rejeté 1 produit — motif « photo manquante »', quand: 'il y a 5 h' },
    { qui: 'RG', action: 'a attribué le badge Vérifié à Ets Traoré Céréales', quand: 'hier' },
    { qui: 'AN', action: 'a suspendu Menuiserie Moderne Adjamé', quand: 'hier' },
    { qui: 'RG', action: 'a approuvé 6 fournisseurs en lot', quand: 'il y a 3 jours' },
  ],

  /* ---- Équipe & rôles (bloc inventé) ---- */
  equipe: [
    { initiales: 'RG', nom: 'Rodrigue Guedeu', role: 'Super-admin' },
    { initiales: 'AN', nom: 'Anno', role: 'Modérateur' },
  ],

  /* ---- Historique de connexion (bloc inventé) ---- */
  connexions: [
    { qui: 'Anno', plage: '09:12 – 12:40', quand: "aujourd'hui" },
    { qui: 'Rodrigue', plage: '08:05 – 08:31', quand: "aujourd'hui" },
    { qui: 'Anno', plage: '14:20 – 17:55', quand: 'hier' },
  ],

  /* ---- Feuille de route (bloc inventé — annonces produit, pas des chiffres) ---- */
  feuilleDeRoute: [
    { libelle: 'Fournisseurs (sourcing)', statut: 'En ligne · Actif' },
    { libelle: 'Boutique en ligne', statut: '2027' },
    { libelle: 'Paiement intégré (Mobile Money)', statut: '2027' },
    { libelle: 'Publicité', statut: '2028' },
  ],

  /* ---- Aperçu espace modérateur (bloc inventé) ---- */
  apercu: {
    titre: "🚀 Prochaine étape LOOHOO",
    texte: 'Boutique en ligne — 2027',
  },
};

// Texte de rappel affiché en haut de la page admin.
export const TEXTE_RAPPEL = 'a connecté.';
