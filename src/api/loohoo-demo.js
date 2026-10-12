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

/* ---------------------------------------------------------------------------
   ÉCRANS AJOUTÉS AU MODULE FOURNISSEURS (maquette n02) : Produits, Acheteurs,
   Catégories, Conversations, Avis. Les mêmes fonctions existent dans
   src/api/loohoo.js, qui lit la vraie base. En démonstration on rend les valeurs
   des maquettes ; les blocs sans source restent marqués « pas connecté ».
--------------------------------------------------------------------------- */

const RETARD = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export async function chargerProduits({ statut = '' } = {}) {
  const produit = (id, nom, categorie, sous, prix, moq, unite, stock, verif, age) => ({
    id, nom, categorie, sous_categorie: sous, statut: 'publie', actif: true,
    prix_gros_fcfa: prix, prix_unitaire_fcfa: Math.round(prix * 1.35), moq, unite,
    stock_disponible: stock, stock_verifie_le: verif, stock_maj_le: RETARD(12),
    date_ajout: RETARD(age), photo_url: null, motif_rejet: null,
    fournisseur: { id: 'g1', nom: 'Bazin Mania', ville: 'Bamako', badge_verifie: true },
  });
  const tous = [
    produit('p1', 'Bazin riche Getzner', 'Textile', 'Bazin', 4500, 10, 'mètre', 240, RETARD(30), 700),
    produit('p2', 'Bazin riche Super', 'Textile', 'Bazin', 5200, 10, 'mètre', 120, null, 500),
    produit('p3', 'Savon noir Karité 250 g', 'Cosmétiques', 'Savons', 750, 24, 'pièce', 800, RETARD(60), 300),
    { ...produit('p4', 'Panneau solaire 100 W', 'Électronique', 'Solaire', 42000, 5, 'pièce', 18, null, 120),
      statut: 'en_attente', motif_rejet: null },
    { ...produit('p5', 'Casque Bluetooth', 'Électronique', 'Audio', 9500, 12, 'pièce', 60, null, 90),
      statut: 'rejete', motif_rejet: 'photo manquante' },
  ];
  const liste = statut ? tous.filter((p) => p.statut === statut) : tous;
  return {
    produits: liste,
    compte: { total: 1180, publies: 1180, en_attente: 24, rejetes: 11, stock_non_verifie: 37 },
    categories: ['Cosmétiques', 'Électronique', 'Textile'],
  };
}

export async function verifierStockProduit() {
  return null; // en démonstration, rien n'est écrit
}

export async function deciderProduit() {
  // En démonstration, rien n'est écrit dans la base : on confirme simplement l'appel.
  return 'démonstration (aucune écriture)';
}

export async function chargerAcheteurs() {
  return {
    acheteurs: [
      { id: 'v1', nom: 'Aya Boutique', activite: 'Boutique de tissus', pays: 'CI', telephone: '2250700000001', email: 'aya@exemple.ci', inscription: RETARD(50) },
      { id: 'v2', nom: 'Sika Cosmetics Shop', activite: 'Cosmétiques', pays: 'SN', telephone: '221770000002', email: 'sika@exemple.sn', inscription: RETARD(200) },
      { id: 'v3', nom: 'Koné Électro', activite: 'Électronique', pays: 'ML', telephone: '22366000003', email: null, inscription: RETARD(30) },
      { id: 'v4', nom: 'Faso Market', activite: 'Alimentation', pays: 'BF', telephone: '22670000004', email: 'faso@exemple.bf', inscription: RETARD(9) },
    ],
    compte: { total: 1280, nouveaux_7j: 96, parPays: { CI: 620, SN: 240, ML: 180, BF: 140, TG: 100 } },
  };
}

export async function chargerCategories() {
  const cat = (id, nom, ordre, produits, sous) => ({ id, nom, ordre, active: true, produits, sous });
  return {
    categories: [
      cat('c1', 'Textile', 1, 420, [
        { id: 's1', categorie_id: 'c1', nom: 'Bazin', ordre: 1, active: true },
        { id: 's2', categorie_id: 'c1', nom: 'Pagne', ordre: 2, active: true },
        { id: 's3', categorie_id: 'c1', nom: 'Wax', ordre: 3, active: true },
      ]),
      cat('c2', 'Cosmétiques', 2, 310, [
        { id: 's4', categorie_id: 'c2', nom: 'Savons', ordre: 1, active: true },
        { id: 's5', categorie_id: 'c2', nom: 'Huiles', ordre: 2, active: true },
      ]),
      cat('c3', 'Électronique', 3, 280, [
        { id: 's6', categorie_id: 'c3', nom: 'Solaire', ordre: 1, active: true },
        { id: 's7', categorie_id: 'c3', nom: 'Audio', ordre: 2, active: true },
      ]),
    ],
    orphelines: ['Alimentation'],
    sansCategorie: 6,
    pays: [
      { code: 'CI', nom: 'Côte d’Ivoire', dans: true, devise: 'FCFA', indicatif: '+225', ordre: 1, actif: true },
      { code: 'SN', nom: 'Sénégal', dans: true, devise: 'FCFA', indicatif: '+221', ordre: 2, actif: true },
      { code: 'ML', nom: 'Mali', dans: true, devise: 'FCFA', indicatif: '+223', ordre: 3, actif: true },
      { code: 'BF', nom: 'Burkina Faso', dans: true, devise: 'FCFA', indicatif: '+226', ordre: 4, actif: false },
    ],
    compteProduits: 1180,
  };
}

export async function renommerCategorie() { return null; }
export async function renommerSousCategorie() { return null; }

export async function chargerAvis(statut = 'en_attente') {
  const avis = (id, note, commentaire, qui, age) => ({
    id, note, commentaire, statut, motif_rejet: statut === 'rejete' ? 'propos injurieux' : null,
    quand: RETARD(age), modere: statut === 'en_attente' ? null : RETARD(age - 2),
    fournisseur: qui.f, acheteur: qui.a,
  });
  const tous = [
    avis('a1', 5, 'Livraison rapide, tissus conformes.', { f: 'Bazin Mania', a: 'Aya Boutique' }, 20),
    avis('a2', 4, 'Bon rapport qualité-prix, un peu de retard.', { f: 'Sika Beauty', a: 'Koné Électro' }, 44),
    avis('a3', 5, 'Très bon contact.', { f: 'Électro Plus CI', a: 'Faso Market' }, 200),
    avis('a4', 1, 'Jamais reçu ma commande.', { f: 'Koné Textiles', a: 'Aya Boutique' }, 300),
  ];
  const liste = tous.filter((a) => a.statut === statut || a.statut === 'en_attente');
  return {
    avis: liste,
    statut,
    compte: { total: liste.length, parNote: { 1: 1, 2: 0, 3: 0, 4: 1, 5: 2 }, moyenne: '3,8' },
  };
}

export async function modererAvis() { return null; }

export async function chargerConversations() {
  const conv = (id, acheteur, fournisseur, msgs, quand) => ({
    id,
    quand,
    fournisseur: { id: 'g1', nom: fournisseur, ville: 'Bamako' },
    acheteur: { id: 'v1', nom: acheteur, activite: 'Boutique de tissus' },
    messages: msgs,
    nbMessages: msgs.length,
    repondu: msgs.some((m) => m.expediteur === 'fournisseur'),
    signales: msgs.filter((m) => m.signale && !m.signale_traite).length,
    statut: null,
  });
  return {
    conversations: [
      conv('k1', 'Aya Boutique', 'Bazin Mania', [
        { id: 'm1', conversation_id: 'k1', expediteur: 'vendeur', contenu: 'Bonjour, quel est le prix du bazin au mètre ?', date_envoi: RETARD(30), lu: true, signale: false, signale_traite: false },
        { id: 'm2', conversation_id: 'k1', expediteur: 'fournisseur', contenu: 'Bonjour, 4 500 FCFA le mètre, minimum 10 mètres.', date_envoi: RETARD(28), lu: true, signale: false, signale_traite: false },
      ], RETARD(28)),
      conv('k2', 'Koné Électro', 'Électro Plus CI', [
        { id: 'm3', conversation_id: 'k2', expediteur: 'vendeur', contenu: 'Appelez-moi au 07 00 00 00 01 pour le panneau solaire.', date_envoi: RETARD(70), lu: true, signale: true, signale_traite: false },
      ], RETARD(70)),
    ],
    compte: { total: 412, sansReponse: 37, signales: 2 },
  };
}

export async function marquerMessageTraite() { return null; }
