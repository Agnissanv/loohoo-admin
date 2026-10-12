/*
  ⚠️  JEU DE DÉMONSTRATION — SERVEUR DE DÉVELOPPEMENT UNIQUEMENT  ⚠️

  Ce fichier remplace src/api/loohoo.js quand on lance « npm run dev » avec
  VITE_DEMO_ADMIN=1 (voir le greffon « demo-locale » dans vite.config.js).
  Il permet de VOIR les écrans remplis sans compte administrateur, sans jamais
  lire ni écrire la vraie base.

  Il n'est JAMAIS utilisé par la version compilée (npm run build) ni par le site
  en ligne : là, c'est src/api/loohoo.js qui lit la base LOOHOO.

  Les valeurs ci-dessous sont celles des maquettes validées par le client.
  Les blocs sans source réelle y sont marqués « pas connecté », comme en ligne.

  Pour désactiver : VITE_DEMO_ADMIN=0 dans .env.local puis relancer « npm run dev ».
*/

const JOUR = 24 * 60 * 60 * 1000;

function serie(base, pas) {
  return Array.from({ length: 12 }, (_, i) => base + i * pas);
}

export const SANS_SOURCE = 'pas connecté — aucune source dans le code';

/*
  Mêmes petites aides d'affichage que src/api/loohoo.js (durée écrite, mois courts,
  montant en FCFA). Elles sont recopiées ici, et non réexportées depuis loohoo.js :
  en démonstration, le greffon de vite.config.js redirige tout import de loohoo.js
  vers ce fichier, un réexport serait donc un import de soi-même.
*/
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function ilYA(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (Number.isNaN(diff)) return '—';
  const min = Math.floor(diff / 60000);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return 'hier';
  return `il y a ${j} j`;
}

function eurosFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export { MOIS, ilYA, eurosFcfa };

export function resumeSources() {
  return 'Démonstration locale (VITE_DEMO_ADMIN=1) : les blocs sont remplis avec les '
    + 'valeurs des maquettes. En ligne, les mêmes blocs lisent la base LOOHOO.';
}

export async function chargerGeneral() {
  return {
    ca: {
      ceMois: 612000,
      variation: '+9 %',
      gmvFacilite: 14200000,
      partCaptee: '4,3 %',
      detailRevenu: 'démonstration',
      series: {
        Revenu: [380, 410, 452, 430, 495, 520, 498, 545, 560, 590, 604, 612],
        GMV: [9.1, 9.8, 10.4, 10.2, 11.3, 11.9, 11.6, 12.4, 12.9, 13.4, 13.8, 14.2],
        Fournisseurs: serie(268, 6),
        Acheteurs: serie(940, 30),
      },
      unites: { Revenu: 'k F CFA', GMV: 'M F CFA', Fournisseurs: '', Acheteurs: '' },
    },
    santeReseau: [
      { libelle: 'Rétention fournisseurs (30 jours)', valeur: '81 %' },
      { libelle: 'Délai avant 1re vente', valeur: '6 jours' },
      { libelle: 'Concentration GMV', valeur: '38 %' },
    ],
    surveillanceInventee: [
      { libelle: 'Coordonnées détectées', valeur: 2 },
      { libelle: 'Demandes sans réponse', valeur: 1 },
    ],
    litiges: {
      enAttente: 2, enCours: 1, resolus: 4, volume: 3800000, commission: 380000, parType: [],
    },
    alertesStock: { actives: 3, enVerification: 1, resolues: 5 },
    journal: [
      { qui: 'RG', action: 'a publié Yopougon Cosmétiques SARL', quand: 'il y a 2 h' },
      { qui: 'AN', action: 'a rejeté 1 produit — motif « photo manquante »', quand: 'il y a 5 h' },
      { qui: 'RG', action: 'a attribué le badge Vérifié à Ets Traoré Céréales', quand: 'hier' },
    ],
    equipe: [
      { initiales: 'RG', nom: 'Rodrigue Guedeu', role: 'Super-admin' },
      { initiales: 'AN', nom: 'Anno', role: 'Modérateur' },
    ],
    sources: { ca: 'reel', santeReseau: 'reel', surveillance: 'reel', litiges: 'reel', alertesStock: 'reel', journal: 'reel', equipe: 'reel', parrainages: 'absent', connexions: 'absent' },
  };
}

export async function chargerFournisseurs() {
  const jours = [3, 5, 4, 7, 6, 8, 9];
  return {
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
      { cle: 'fournisseurs', libelle: 'Fournisseurs', valeur: '340 publiés', hausse: '+6 %', points: jours, note: 'Fournisseurs publiés (7 derniers jours).' },
      { cle: 'produits', libelle: 'Produits', valeur: '1 180 produits', hausse: '+11 %', points: [5, 6, 6, 8, 7, 9, 11], note: 'Produits publiés (7 derniers jours).' },
      { cle: 'acheteurs', libelle: 'Acheteurs', valeur: '1 280 acheteurs', hausse: '+17 %', points: [4, 4, 5, 6, 7, 8, 10], note: 'Acheteurs inscrits (7 derniers jours).' },
      { cle: 'demandes', libelle: 'Demandes', valeur: '214 demandes', hausse: '+4 %', points: [2, 3, 3, 4, 4, 5, 6], note: 'Demandes de mise en relation (7 derniers jours).' },
    ],
    aTraiter: [
      { icone: '🏭', valeur: '6', libelle: 'Fournisseurs à valider', to: '/fournisseurs/en-attente' },
      { icone: '🤝', valeur: '2', libelle: 'Litiges en attente', to: '/service-client' },
      { icone: '⚠️', valeur: '2', libelle: 'Coordonnées détectées' },
    ],
    apercu: [
      { icone: '📈', valeur: '612 000 FCFA', libelle: 'Revenu LOOHOO (abonnements — démonstration)', to: '/' },
      { icone: '🔗', valeur: '—', libelle: 'Filleuls actifs — pas connecté (aucune table de parrainage)' },
    ],
    sources: { hero: 'reel', courbe: 'reel', aTraiter: 'reel', apercu: 'partiel' },
  };
}

export async function chargerValidation() {
  const dossiers = [
    { id: 'd1', nom: 'Bazin Mania', pays: 'Bamako, Mali', categorie: 'Textile', soumis: 'il y a 4 h', documents: 3, photos: 2, urgent: false, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
    { id: 'd2', nom: 'Sika Beauty', pays: 'Abidjan, Côte d’Ivoire', categorie: 'Cosmétiques', soumis: 'il y a 7 h', documents: 2, photos: 3, urgent: false, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
    { id: 'd3', nom: 'Électro Plus CI', pays: 'Abidjan, Côte d’Ivoire', categorie: 'Électronique', soumis: 'hier', documents: 1, photos: 1, urgent: true, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
    { id: 'd4', nom: 'Koné Textiles', pays: 'Bamako, Mali', categorie: 'Textile', soumis: 'hier', documents: 3, photos: 4, urgent: false, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
    { id: 'd5', nom: 'Faso Danfani Tissus', pays: 'Ouagadougou, Burkina Faso', categorie: 'Textile', soumis: 'il y a 2 j', documents: 2, photos: 2, urgent: true, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
    { id: 'd6', nom: 'Awa Cosmétiques', pays: 'Dakar, Sénégal', categorie: 'Cosmétiques', soumis: 'il y a 3 j', documents: 2, photos: 3, urgent: true, recrutePar: 'pas connecté — la base ne stocke pas qui a recruté' },
  ];
  return {
    titre: 'File de validation',
    resume: `Dossiers de fournisseurs en attente de décision (${dossiers.length}).`,
    dossiers,
    heroStats: [
      { valeur: '14', libelle: 'Validés (semaine)' },
      { valeur: '3', libelle: 'Rejetés (semaine)' },
    ],
    sources: { dossiers: 'reel', heroStats: 'reel', recrutePar: 'absent' },
  };
}

export async function deciderFournisseur() {
  // En démonstration, rien n'est écrit : on confirme simplement l'appel.
  return null;
}

export async function chargerModerateur() {
  return {
    persona: { nom: 'Anno', initiales: 'AN' },
    hero: { stats: [{ valeur: '14', libelle: 'Validés (semaine)' }, { valeur: '3', libelle: 'Rejetés (semaine)' }, { valeur: '17', libelle: 'Décisions (semaine)' }] },
    journee: { date: new Date().toLocaleDateString('fr-FR'), aujourdhui: 10, hier: 8, semaine: 52 },
    dossier: {
      id: 'd1',
      nom: 'Bazin Mania',
      documents: ['🪪', '📦', '🏬'],
      infos: [
        { libelle: 'Pays', valeur: 'Bamako, Mali' },
        { libelle: 'Catégorie', valeur: 'Textile' },
        { libelle: 'Stock déclaré', valeur: 'Confirmé' },
        { libelle: 'Recruté par', valeur: 'pas connecté' },
        { libelle: 'Soumis', valeur: 'il y a 4 h' },
      ],
      checklist: [
        { libelle: 'Pièces du dossier fournies', fait: true },
        { libelle: 'Description renseignée', fait: true },
        { libelle: 'Stock confirmé', fait: true },
      ],
    },
    file: [
      { icone: '🏭', valeur: '6', libelle: 'Fournisseurs à vérifier', to: '/fournisseurs/en-attente' },
      { icone: '⏱️', valeur: '1', libelle: '⚠ en attente depuis 48 h', urgent: true, to: '/fournisseurs/en-attente' },
    ],
    publies: { valeur: '340', libelle: 'Fournisseurs publiés — rechercher pour suspendre si besoin', to: '/fournisseurs' },
    sources: { journee: 'reel', hero: 'partiel', dossier: 'reel', file: 'reel', publies: 'reel', commerciaux: 'absent' },
  };
}

export async function chargerServiceClient() {
  return {
    hero: {
      resume: '2 litiges · 3 relances stock en attente (démonstration)',
      stats: [{ valeur: '2', libelle: 'En attente' }, { valeur: '1', libelle: 'En cours' }, { valeur: '4', libelle: 'Résolues' }],
    },
    journee: { date: new Date().toLocaleDateString('fr-FR'), aujourdhui: 7, hier: 9, semaine: 41 },
    affaires: [],
    litige: {
      id: 'l1',
      numero: '#214',
      origine: 'Affaire contestée',
      acheteur: { nom: 'Aya Boutique', meta: 'démonstration' },
      fournisseur: { nom: 'Bazin Mania', meta: 'Bamako, Mali' },
      fil: [
        { de: 'Aya Boutique', texte: "J'ai payé mais je n'ai rien reçu depuis 5 jours" },
        { de: 'Bazin Mania', texte: 'Le colis est parti, contactez le transporteur' },
      ],
      types: ['Paiement', 'Délai / stock', 'Autre'],
      preuves: 2,
      montant: 850000,
    },
    fileLitiges: [{ icone: '⭐', nom: 'Koné Textiles', libelle: 'Note 1★ détectée automatiquement', tag: 'Auto' }],
    alertesStock: [
      { icone: '📦', nom: 'Koné Textiles', libelle: 'Stock non vérifié depuis 6 jours', urgent: true },
      { icone: '📞', nom: 'Électro Plus CI', libelle: 'Stock non vérifié depuis 3 jours', urgent: false },
    ],
    sources: { affaires: 'reel', litige: 'partiel', hero: 'reel', fileLitiges: 'reel', alertesStock: 'reel', journee: 'reel' },
  };
}

export async function trancherAffaire() {
  return null;
}

export async function chargerRecherchesVides() {
  return {
    recherches: [
      { terme: 'moto electrique', categorie: 'Électronique', ville: 'Abidjan', nombre: 4 },
      { terme: 'bazin riche', categorie: 'Textile', ville: 'Bamako', nombre: 2 },
    ],
  };
}
