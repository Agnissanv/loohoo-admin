/*
  ⚠️  BLOCS SANS SOURCE — « PAS CONNECTÉ »  ⚠️

  Ce fichier ne contient plus AUCUN chiffre inventé. Il ne garde que :
  1. les textes d'écran (titres, notes) qui ne sont pas des données ;
  2. les valeurs de repli explicites « pas connecté » pour les blocs dont la
     source n'existe ni en base ni dans le code source.

  Tout le reste est lu en direct dans la base LOOHOO par `src/api/loohoo.js`
  (sources et justification : docs/PLAN-DE-BRANCHEMENT.md).

  Blocs explicitement SANS SOURCE (vérifié dans le code des trois dépôts) :
  - Parrainages / filleuls          : aucune table de parrainage dans l'annuaire
  - Historique de connexion         : la table `session_connexion` n'existe pas
  - Commerciaux terrain             : aucune table des commerciaux
  - Recruté par (dossier)           : la base ne stocke pas qui a recruté
  - Type de litige (paiement/délai) : `affaire` n'a pas de type
  - « Relancé hier » (stock)        : aucune trace de relance
  - Resoumission d'un dossier       : pas d'historique de resoumission
*/

export const SANS_SOURCE = 'pas connecté — aucune source dans le code';

export const DONNEES_ESPACES = {
  /* ---------- n02 — Espace fournisseurs (vue admin) ---------- */
  fournisseurs: {
    titre: 'Espace Fournisseurs',
    note:
      "Hero, courbe et « À traiter » sont lus dans la base LOOHOO. "
      + 'Le bloc des filleuls reste sans source : il n’existe aucune table de '
      + 'parrainage dans l’annuaire. Détail complet dans docs/PLAN-DE-BRANCHEMENT.md.',
  },

  /* ---------- n03 — Espace modérateur (vue Anno) ---------- */
  moderateur: {
    // Pas de source : aucune table des commerciaux terrain.
    commerciaux: { valeur: '—', libelle: SANS_SOURCE },
    // Pas de source : pas d'historique de resoumission.
    resoumission: SANS_SOURCE,
    note:
      'Votre journée, le dossier en cours, la file d’attente et les fournisseurs '
      + 'publiés viennent du journal d’audit et de la base LOOHOO. Les commerciaux '
      + 'terrain n’existent pas côté code : le bloc reste marqué « pas connecté ».',
  },

  /* ---------- n04 — Service client & litiges (vue Marie C.) ---------- */
  serviceClient: {
    // Pas de source : `affaire` ne porte pas de type de litige.
    types: ['Paiement', 'Délai / stock', 'Autre'],
    note:
      'Les litiges sont les affaires proposées / contestées de la base LOOHOO '
      + '(avec leur conversation et leurs pièces). Le type de litige et les '
      + 'relances automatiques n’existent pas côté code : ces blocs restent '
      + 'marqués « pas connecté ».',
  },

  /* ---------- File de validation des fournisseurs ---------- */
  validation: {
    titre: 'File de validation',
    resume: 'Dossiers de fournisseurs en attente de décision.',
    dossiers: [],
    note:
      'Chaque dossier vient de la table `grossiste` (statut « en attente »), avec '
      + 'ses pièces (`document_fournisseur`) et ses photos. La décision passe par '
      + '`admin_decider_fournisseur`. Le champ « recruté par » n’existe pas en base.',
  },

  roadmap: { texte: 'Prochaine étape LOOHOO : Boutique en ligne', annee: '2027' },
};
