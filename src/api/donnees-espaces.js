/*
  ⚠️  DONNÉES FICTIVES — AUCUNE SOURCE RÉELLE  ⚠️

  Contenu des écrans « espace par rôle » (maquettes n02, n03, n04) :
  - Espace fournisseurs (vue admin)
  - Espace modérateur (vue Anno)
  - Service client & litiges (vue Marie C.)

  Tous les chiffres ci-dessous sont recopiés des maquettes du client : ce sont
  des EXEMPLES d'affichage. Aucun ne vient de la base LOOHOO.

  Règle du projet : ne jamais recopier ces valeurs dans du code de production,
  et ne jamais les « brancher » sur une source imaginaire. Quand une vraie table
  existera (litige, avis, message, relance stock…), remplacer la lecture par
  l'appel réel dans src/api/admin.js puis supprimer la valeur ici.
*/

export const DONNEES_ESPACES = {
  /* ---------- n02 — Espace fournisseurs (vue admin) ---------- */
  fournisseurs: {
    hero: {
      titre: 'Espace Fournisseurs',
      resume: 'Tout est à jour — 6 dossiers en attente de traitement.',
      stats: [
        { valeur: '340', libelle: 'Fournisseurs publiés' },
        { valeur: '1 180', libelle: 'Produits publiés' },
        { valeur: '1 280', libelle: 'Acheteurs' },
        { valeur: '214', libelle: 'Demandes (7j)' },
      ],
    },
    courbe: [
      {
        cle: 'fournisseurs',
        libelle: 'Fournisseurs',
        valeur: '340 publiés',
        hausse: '+6 %',
        points: [72, 65, 62, 54, 48, 38, 26],
        note: 'Fournisseurs vérifiés et publiés sur la plateforme.',
      },
      {
        cle: 'produits',
        libelle: 'Produits',
        valeur: '1 180 produits',
        hausse: '+11 %',
        points: [75, 68, 60, 55, 45, 35, 15],
        note: 'Produits actuellement publiés, tous fournisseurs confondus.',
      },
      {
        cle: 'acheteurs',
        libelle: 'Acheteurs',
        valeur: '1 280 acheteurs',
        hausse: '+17 %',
        points: [78, 68, 60, 52, 40, 28, 14],
        note: 'Acheteurs inscrits ayant au moins consulté un fournisseur.',
      },
      {
        cle: 'demandes',
        libelle: 'Demandes',
        valeur: '214 demandes',
        hausse: '+4 %',
        points: [60, 65, 55, 58, 48, 50, 35],
        note: 'Demandes de mise en relation reçues sur 7 jours.',
      },
    ],
    aTraiter: [
      { icone: '🏭', valeur: '6', libelle: 'Fournisseurs à valider', to: '/fournisseurs/en-attente' },
      { icone: '🤝', valeur: '2', libelle: 'Litiges en attente', to: '/service-client' },
      { icone: '⚠️', valeur: '2', libelle: 'Coordonnées détectées' },
    ],
    apercu: [
      { icone: '📈', valeur: '612 000 FCFA', libelle: 'Revenu LOOHOO ce mois (+9 %)', to: '/' },
      { icone: '🔗', valeur: '23 / 7', libelle: 'Filleuls actifs — acheteurs / fournisseurs' },
    ],
    note:
      "Le détail de chaque ligne s'ouvre dans son propre écran, accessible aussi "
      + 'depuis le menu : À traiter, Fournisseurs, Produits, Acheteurs, Conversations, '
      + 'Affaires & abonnements, Leads, Catégories, Journal d’audit, Équipe & rôles. '
      + '« Demandes non couvertes » se trouve dans l’onglet Général, pas ici.',
  },

  /* ---------- n03 — Espace modérateur (vue Anno) ---------- */
  moderateur: {
    persona: { nom: 'Anno', initiales: 'AN', depuis: '09:12', enAttente: 6 },
    hero: {
      stats: [
        { valeur: '14', libelle: 'Validés (semaine)' },
        { valeur: '3', libelle: 'Rejetés (semaine)' },
        { valeur: '2h10', libelle: 'Délai moyen' },
      ],
    },
    journee: { date: 'Mercredi 7 octobre', aujourdhui: 10, hier: 8, semaine: 52 },
    dossier: {
      nom: 'Bazin Mania',
      resoumission: '↻ Resoumis — rejeté le 2 oct.',
      documents: ['🪪', '📦', '🏬'],
      infos: [
        { libelle: 'Pays', valeur: '🇲🇱 Bamako, Mali' },
        { libelle: 'Catégorie', valeur: 'Textile' },
        { libelle: 'Stock déclaré', valeur: 'Disponible' },
        { libelle: 'Recruté par', valeur: 'Jean K. (commercial)' },
        { libelle: 'Soumis', valeur: 'Il y a 4 h' },
      ],
      checklist: [
        { libelle: "Document d'identité lisible", fait: true },
        { libelle: 'Photo du stock cohérente', fait: true },
        { libelle: 'Local cohérent avec la ville déclarée', fait: false },
      ],
    },
    file: [
      { icone: '🏭', valeur: '6', libelle: 'Fournisseurs à vérifier', to: '/fournisseurs/en-attente' },
      { icone: '⏱️', valeur: '1', libelle: '⚠ en attente depuis 48 h', urgent: true, to: '/fournisseurs/en-attente' },
    ],
    publies: { valeur: '340', libelle: 'Fournisseurs actifs — rechercher pour suspendre si besoin', to: '/fournisseurs' },
    commerciaux: { valeur: '2', libelle: 'Commerciaux terrain actifs' },
    note:
      'Chaque ligne ci-dessus s’ouvre dans son propre écran : file d’attente '
      + 'complète (recherche), détail fournisseur, et gestion des commerciaux '
      + '(ajouter / retirer — limité au rôle commercial).',
  },

  /* ---------- n04 — Service client & litiges (vue Marie C.) ---------- */
  serviceClient: {
    persona: { nom: 'Marie C.', initiales: 'MC', enAttente: 2 },
    hero: {
      resume: '2 litiges · 3 relances stock en attente',
      stats: [
        { valeur: '2', libelle: 'En attente' },
        { valeur: '1', libelle: 'En cours' },
        { valeur: '4', libelle: 'Résolus (7j)' },
      ],
    },
    journee: { date: 'Mercredi 7 octobre', aujourdhui: 7, hier: 9, semaine: 41 },
    litige: {
      numero: '#214',
      origine: "Signalé par l'acheteur",
      acheteur: { nom: 'Aya Boutique', meta: '★ 4.8 · 0 litige antérieur' },
      fournisseur: { nom: 'Bazin Mania', meta: '★ 4.9 · 1 litige antérieur' },
      fil: [
        { de: 'Aya Boutique', texte: "J'ai payé mais je n'ai rien reçu depuis 5 jours" },
        { de: 'Bazin Mania', texte: 'Le colis est parti, contactez le transporteur' },
      ],
      types: ['Paiement', 'Délai / stock', 'Autre'],
      preuves: 2,
    },
    fileLitiges: [
      { icone: '⭐', nom: 'Koné Textiles', libelle: 'Note 1★ détectée automatiquement', tag: 'Auto' },
    ],
    alertesStock: [
      { icone: '📦', nom: 'Koné Textiles', libelle: 'Remontée suspecte après grosse vente', urgent: true },
      { icone: '📞', nom: 'Électro Plus CI', libelle: 'Relancé hier — en attente de retour', urgent: false },
    ],
    note:
      'Chaque dossier s’ouvre dans son propre écran avec l’historique complet de la '
      + 'conversation. Les décisions sont journalisées et visibles par le super-admin '
      + 'sous forme de chiffres agrégés uniquement.',
  },

  /* ---------- File de validation des fournisseurs (/fournisseurs/en-attente) ---------- */
  validation: {
    titre: 'File de validation',
    resume: 'Dossiers de fournisseurs en attente de décision.',
    dossiers: [
      {
        nom: 'Bazin Mania', pays: '🇲🇱 Bamako, Mali', categorie: 'Textile',
        soumis: 'Il y a 4 h', recrutePar: 'Jean K. (commercial)', resoumission: true,
      },
      {
        nom: 'Sika Beauty', pays: '🇨🇮 Abidjan, Côte d’Ivoire', categorie: 'Cosmétiques',
        soumis: 'Il y a 7 h', recrutePar: 'Jean K. (commercial)',
      },
      {
        nom: 'Électro Plus CI', pays: '🇨🇮 Abidjan, Côte d’Ivoire', categorie: 'Électronique',
        soumis: 'Hier', recrutePar: 'Inscription directe',
      },
      {
        nom: 'Koné Textiles', pays: '🇲🇱 Bamako, Mali', categorie: 'Textile',
        soumis: 'Hier', recrutePar: 'Jean K. (commercial)',
      },
      {
        nom: 'Faso Danfani Tissus', pays: '🇧🇫 Ouagadougou, Burkina Faso', categorie: 'Textile',
        soumis: 'Il y a 2 j', recrutePar: 'Inscription directe',
      },
      {
        nom: 'Awa Cosmétiques', pays: '🇸🇳 Dakar, Sénégal', categorie: 'Cosmétiques',
        soumis: 'Il y a 3 j', recrutePar: 'Jean K. (commercial)',
      },
    ],
    note:
      'Un dossier s’ouvre ici avec ses pièces, sa checklist et le motif de rejet. '
      + 'La décision (valider / rejeter) est enregistrée sous la journée du modérateur '
      + 'et remonte au super-admin sous forme de chiffres agrégés.',
  },

  roadmap: { texte: 'Prochaine étape LOOHOO : Boutique en ligne', annee: '2027' },
};
