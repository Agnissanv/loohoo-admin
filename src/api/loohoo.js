/*
  LOOHOO Admin — lectures RÉELLES (base de l'annuaire fournisseurs).

  Chaque fonction va chercher la donnée à sa source et ne rend QUE ce qu'elle a
  réellement lu. Les blocs sans source (voir docs/PLAN-DE-BRANCHEMENT.md) ne sont
  pas renvoyés du tout : l'écran garde alors sa mention « pas connecté ».

  Sources utilisées (toutes présentes dans le code source) :
    - fonctions serveur : admin_tableau_de_bord(), stats_fournisseurs(),
      admin_liste_admins(), admin_recherches_vides(), formules_abonnement()
    - tables : grossiste, produit, vendeur, affaire, avis, visite,
      journal_admin, message_masque, document_fournisseur, conversation
*/

import { supabase } from '../supabaseClient.js';

const JOUR = 24 * 60 * 60 * 1000;
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/* ------------------------------------------------------------------ outils */

async function rpc(nom, args = {}) {
  const { data, error } = await supabase.rpc(nom, args);
  if (error) throw error;
  return data;
}

async function compter(table, modifier = (q) => q) {
  const { count, error } = await modifier(
    supabase.from(table).select('*', { count: 'exact', head: true })
  );
  if (error) throw error;
  return count ?? 0;
}

async function lignes(table, select = '*', modifier = (q) => q) {
  const { data, error } = await modifier(supabase.from(table).select(select));
  if (error) throw error;
  return data ?? [];
}

// Une série de 12 points (mois) à partir d'une colonne de date.
function serie12(lignesDates) {
  const maintenant = new Date();
  const bornes = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    bornes.push({ cle: `${d.getFullYear()}-${d.getMonth()}`, quand: d });
  }
  const compte = Object.fromEntries(bornes.map((b) => [b.cle, 0]));
  lignesDates.forEach((v) => {
    if (!v) return;
    const d = new Date(v);
    const cle = `${d.getFullYear()}-${d.getMonth()}`;
    if (cle in compte) compte[cle] += 1;
  });
  return bornes.map((b) => compte[b.cle]);
}

function depuis(date) {
  const d = new Date(date);
  return d.toISOString();
}

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

/* ------------------------------------------------- 1. écran « Général » */

export async function chargerGeneral() {
  const sources = {};
  const resultat = {};

  let bord = null;
  try {
    bord = await rpc('admin_tableau_de_bord');
  } catch { bord = null; }

  let stats = null;
  try {
    stats = await rpc('stats_fournisseurs');
  } catch { stats = null; }

  // --- Chiffre d'affaires : revenu = abonnements de base, GMV = affaires confirmées
  try {
    const formules = await rpc('formules_abonnement');
    const niveaux = formules?.niveaux || [];
    const mensuel = Number(niveaux[0]?.mensuel || 0);
    const abonnes = await compter('grossiste', (q) => q.eq('abonnement_actif', true));
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const debutMoisPrec = new Date(debutMois.getFullYear(), debutMois.getMonth() - 1, 1);
    const nouveaux = await lignes('grossiste', 'date_debut_abonnement', (q) =>
      q.eq('abonnement_actif', true).not('date_debut_abonnement', 'is', null)
    );
    const ceMois = nouveaux.filter((g) => new Date(g.date_debut_abonnement) >= debutMois).length;
    const moisPrec = nouveaux.filter((g) => {
      const d = new Date(g.date_debut_abonnement);
      return d >= debutMoisPrec && d < debutMois;
    }).length;
    const variation = moisPrec > 0
      ? `${ceMois >= moisPrec ? '+' : ''}${Math.round(((ceMois - moisPrec) / moisPrec) * 100)} %`
      : (ceMois > 0 ? 'nouveau' : '0 %');

    const [fournisseursSerie, acheteursSerie] = await Promise.all([
      lignes('grossiste', 'date_ajout', (q) => q.gte('date_ajout', depuis(new Date(Date.now() - 400 * JOUR)))),
      lignes('vendeur', 'date_inscription', (q) => q.gte('date_inscription', depuis(new Date(Date.now() - 400 * JOUR)))).catch(() => []),
    ]);

    const gmv = Number(bord?.affaires?.volume_fcfa || 0);
    const revenu = abonnes * mensuel;
    resultat.ca = {
      ceMois: revenu,
      variation,
      gmvFacilite: gmv,
      partCaptee: gmv > 0 ? `${((revenu / gmv) * 100).toFixed(1).replace('.', ',')} %` : '—',
      // Revenu = abonnés actifs × tarif de base (la base ne stocke pas le niveau de chacun)
      detailRevenu: `${abonnes} abonné${abonnes > 1 ? 's' : ''} actif${abonnes > 1 ? 's' : ''} × ${mensuel.toLocaleString('fr-FR')} F`,
      series: {
        Revenu: serie12(nouveaux.map((g) => g.date_debut_abonnement)),
        GMV: (() => {
          const s = serie12([]);
          s[s.length - 1] = Math.round(gmv / 1000000);
          return s;
        })(),
        Fournisseurs: serie12(fournisseursSerie.map((g) => g.date_ajout)),
        Acheteurs: serie12(acheteursSerie.map((v) => v.date_ajout)),
      },
      unites: { Revenu: 'F CFA', GMV: 'M F CFA', Fournisseurs: '', Acheteurs: '' },
    };
    sources.ca = 'reel';
  } catch { sources.ca = 'absent'; }

  // --- Santé du réseau : ce qui se calcule vraiment
  try {
    const total = Number(stats?.grossistes_total || 0);
    const verifies = Number(stats?.grossistes_verifies || 0);
    const actifs30 = await lignes('visite', 'grossiste_id', (q) =>
      q.gte('date_visite', depuis(new Date(Date.now() - 30 * JOUR)))
    ).catch(() => []);
    const uniques = new Set(actifs30.map((v) => v.grossiste_id));
    resultat.santeReseau = [
      { libelle: 'Fournisseurs vérifiés', valeur: total ? `${Math.round((verifies / total) * 100)} %` : '—' },
      { libelle: 'Fournisseurs consultés (30 j)', valeur: `${uniques.size}` },
      { libelle: 'Fournisseurs publiés', valeur: `${stats?.grossistes_publies ?? 0}` },
    ];
    sources.santeReseau = 'reel';
  } catch { sources.santeReseau = 'absent'; }

  // --- Surveillance
  try {
    const coord = await compter('message_masque').catch(() => 0);
    const sansReponse = Number(bord?.conversations?.sans_reponse || 0);
    resultat.surveillanceInventee = [
      { libelle: 'Coordonnées détectées', valeur: coord },
      { libelle: 'Demandes sans réponse', valeur: sansReponse },
    ];
    sources.surveillance = 'reel';
  } catch { sources.surveillance = 'absent'; }

  // --- Litiges = affaires (proposée / contestée / confirmée)
  try {
    const a = bord?.affaires || {};
    resultat.litiges = {
      enAttente: Number(a.proposees || 0),
      enCours: Number(a.contestees || 0),
      resolus: Number(a.confirmees || 0),
      volume: Number(a.volume_fcfa || 0),
      commission: Number(a.commission_a_facturer || 0),
      taux: Number(a.taux || 0),
      parType: [],
    };
    sources.litiges = 'reel';
  } catch { sources.litiges = 'absent'; }

  // --- Alertes stock = produits dont le stock n'est pas confirmé
  try {
    const nonVerifie = await compter('produit', (q) => q.is('stock_verifie_le', null)).catch(() => 0);
    const attente = await compter('produit', (q) => q.eq('statut', 'en_attente')).catch(() => 0);
    const total = await compter('produit').catch(() => 0);
    resultat.alertesStock = { actives: nonVerifie, enVerification: attente, resolues: Math.max(total - nonVerifie, 0) };
    sources.alertesStock = 'reel';
  } catch { sources.alertesStock = 'absent'; }

  // --- Journal des décisions = journal_admin (+ admins pour les initiales)
  try {
    const journal = await lignes('journal_admin', 'id, date_action, admin_id, action, cible_type, cible_id, details', (q) =>
      q.order('date_action', { ascending: false }).limit(6)
    );
    const admins = await rpc('admin_liste_admins').catch(() => []);
    resultat.journal = journal.map((j) => {
      const auteur = admins.find((x) => x.user_id === j.admin_id);
      const initiales = auteur ? (auteur.email || '').slice(0, 2).toUpperCase() : '—';
      const nom = j.details?.nom || j.cible_id?.slice(0, 8) || '';
      let action = j.action;
      if (j.action === 'fournisseur_statut') action = `a ${j.details?.apres === 'publie' ? 'publié' : j.details?.apres || 'changé'} ${nom}`;
      else if (j.action === 'fournisseur_badge') action = `a ${j.details?.apres ? 'attribué' : 'retiré'} le badge Vérifié à ${nom}`;
      else action = `${j.action} — ${nom}`;
      return { qui: initiales, action, quand: ilYA(j.date_action) };
    });
    sources.journal = 'reel';
  } catch { sources.journal = 'absent'; }

  // --- Équipe & rôles = admin_liste_admins()
  try {
    const membres = await rpc('admin_liste_admins');
    resultat.equipe = (membres || []).map((m) => ({
      initiales: (m.email || '??').slice(0, 2).toUpperCase(),
      nom: m.email,
      role: m.role === 'super_admin' ? 'Super-admin' : 'Modérateur',
    }));
    sources.equipe = 'reel';
  } catch { sources.equipe = 'absent'; }

  // --- Sans source : ni table de parrainage, ni table de connexions
  sources.parrainages = 'absent';
  sources.connexions = 'absent';

  return { ...resultat, sources };
}

/* ------------------------------------------ 2. écran « Fournisseurs » (n02) */

export async function chargerFournisseurs() {
  const sources = {};
  const resultat = {};

  let stats = null;
  let bord = null;
  try { stats = await rpc('stats_fournisseurs'); } catch { stats = null; }
  try { bord = await rpc('admin_tableau_de_bord'); } catch { bord = null; }

  const debut = depuis(new Date(Date.now() - 7 * JOUR));
  const depuis12 = depuis(new Date(Date.now() - 400 * JOUR));

  // --- Hero
  try {
    const [acheteurs, demandes7j] = await Promise.all([
      Promise.resolve(Number(bord?.acheteurs || 0)),
      compter('conversation', (q) => q.gte('derniere_activite', debut)).catch(() => 0),
    ]);
    const enAttente = Number(stats?.grossistes_en_attente || 0);
    resultat.hero = {
      titre: 'Espace Fournisseurs',
      resume: enAttente === 0
        ? 'Tout est à jour — aucun dossier en attente de traitement.'
        : `${enAttente} dossier${enAttente > 1 ? 's' : ''} en attente de traitement.`,
      stats: [
        { valeur: `${stats?.grossistes_publies ?? 0}`, libelle: 'Fournisseurs publiés' },
        { valeur: `${stats?.produits_total ?? 0}`, libelle: 'Produits publiés' },
        { valeur: `${acheteurs}`, libelle: 'Acheteurs' },
        { valeur: `${demandes7j}`, libelle: 'Demandes (7j)' },
      ],
    };
    sources.hero = 'reel';
  } catch { sources.hero = 'absent'; }

  // --- Courbe à onglets (7 jours : créations par jour)
  try {
    const [grossistes, produits, acheteurs, demandes] = await Promise.all([
      lignes('grossiste', 'date_ajout', (q) => q.gte('date_ajout', depuis(new Date(Date.now() - 7 * JOUR)))),
      lignes('produit', 'date_ajout', (q) => q.gte('date_ajout', depuis(new Date(Date.now() - 7 * JOUR)))),
      lignes('vendeur', 'date_inscription', (q) => q.gte('date_inscription', depuis(new Date(Date.now() - 7 * JOUR)))).catch(() => []),
      lignes('conversation', 'derniere_activite', (q) => q.gte('derniere_activite', depuis(new Date(Date.now() - 7 * JOUR)))).catch(() => []),
    ]);
    const parJour = (liste, champ) => {
      const jours = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(Date.now() - i * JOUR);
        const cle = d.toISOString().slice(0, 10);
        jours.push(liste.filter((x) => String(x[champ]).slice(0, 10) === cle).length);
      }
      return jours;
    };
    const hausse = (points) => {
      const premier = points.find((p) => p > 0) || 0;
      const dernier = points[points.length - 1] || 0;
      if (!premier) return dernier > 0 ? 'nouveau' : '0 %';
      return `${dernier >= premier ? '+' : ''}${Math.round(((dernier - premier) / premier) * 100)} %`;
    };
    const pF = parJour(grossistes, 'date_ajout');
    const pP = parJour(produits, 'date_ajout');
    const pA = parJour(acheteurs, 'date_ajout');
    const pD = parJour(demandes, 'date_creation');
    resultat.courbe = [
      { cle: 'fournisseurs', libelle: 'Fournisseurs', valeur: `${stats?.grossistes_publies ?? 0} publiés`, hausse: hausse(pF), points: pF, note: 'Fournisseurs publiés sur la plateforme (7 derniers jours).' },
      { cle: 'produits', libelle: 'Produits', valeur: `${stats?.produits_total ?? 0} produits`, hausse: hausse(pP), points: pP, note: 'Produits publiés, tous fournisseurs confondus (7 derniers jours).' },
      { cle: 'acheteurs', libelle: 'Acheteurs', valeur: `${bord?.acheteurs ?? 0} acheteurs`, hausse: hausse(pA), points: pA, note: 'Acheteurs inscrits (7 derniers jours).' },
      { cle: 'demandes', libelle: 'Demandes', valeur: `${demandes.length} demandes`, hausse: hausse(pD), points: pD, note: 'Demandes de mise en relation reçues (7 derniers jours).' },
    ];
    sources.courbe = 'reel';
  } catch { sources.courbe = 'absent'; }

  // --- « À traiter »
  try {
    const coord = await compter('message_masque').catch(() => 0);
    resultat.aTraiter = [
      { icone: '🏭', valeur: `${stats?.grossistes_en_attente ?? 0}`, libelle: 'Fournisseurs à valider', to: '/fournisseurs/en-attente' },
      { icone: '🤝', valeur: `${bord?.affaires?.contestees ?? 0}`, libelle: 'Litiges en attente', to: '/service-client' },
      { icone: '⚠️', valeur: `${coord}`, libelle: 'Coordonnées détectées' },
    ];
    sources.aTraiter = 'reel';
  } catch { sources.aTraiter = 'absent'; }

  // --- Aperçu : revenu (abonnements) réel ; parrainage sans source
  try {
    const formules = await rpc('formules_abonnement');
    const mensuel = Number(formules?.niveaux?.[0]?.mensuel || 0);
    const abonnes = await compter('grossiste', (q) => q.eq('abonnement_actif', true));
    resultat.apercu = [
      { icone: '📈', valeur: eurosFcfa(abonnes * mensuel), libelle: `Revenu LOOHOO (abonnements — ${abonnes} actif${abonnes > 1 ? 's' : ''})`, to: '/' },
      { icone: '🔗', valeur: '—', libelle: 'Filleuls actifs — pas connecté (aucune table de parrainage)' },
    ];
    sources.apercu = 'partiel';
  } catch { sources.apercu = 'absent'; }

  // --- Surveillance / santé : rien de spécifique ici, l'écran Général s'en charge
  return { ...resultat, sources };
}

/* ---------------------------- 3. écran « File de validation » (en-attente) */

export async function chargerValidation() {
  const sources = {};
  const resultat = {};

  try {
    const attente = await lignes(
      'grossiste',
      'id, nom, ville, pays, categorie, date_ajout, badge_verifie, stock_confirme, description',
      (q) => q.eq('statut', 'en_attente').order('date_ajout', { ascending: false })
    );
    const documents = await lignes('document_fournisseur', '*').catch(() => []);
    const photos = await lignes('grossiste_photo', 'grossiste_id, url').catch(() => []);

    resultat.dossiers = attente.map((g) => {
      const docs = documents.filter((d) => d.grossiste_id === g.id);
      const photosG = photos.filter((p) => p.grossiste_id === g.id);
      const enAttente48 = Date.now() - new Date(g.date_ajout).getTime() > 2 * JOUR;
      return {
        id: g.id,
        nom: g.nom,
        pays: [g.ville, g.pays].filter(Boolean).join(', ') || '—',
        categorie: g.categorie || '—',
        soumis: ilYA(g.date_ajout),
        documents: docs.length,
        photos: photosG.length,
        urgent: enAttente48,
        recrutePar: 'pas connecté — la base ne stocke pas qui a recruté',
        resume: g.description || '',
      };
    });
    resultat.titre = 'File de validation';
    resultat.resume = resultat.dossiers.length
      ? `Dossiers de fournisseurs en attente de décision (${resultat.dossiers.length}).`
      : 'Aucun dossier en attente.';
    sources.dossiers = 'reel';
    sources.recrutePar = 'absent';
  } catch { sources.dossiers = 'absent'; }

  // --- Décisions de la semaine (journal d'audit) pour l'en-tête
  try {
    const journal = await lignes('journal_admin', 'date_action, action, details', (q) =>
      q.gte('date_action', depuis(new Date(Date.now() - 7 * JOUR))).eq('action', 'fournisseur_statut')
    );
    resultat.heroStats = [
      { valeur: `${journal.filter((j) => j.details?.apres === 'publie').length}`, libelle: 'Validés (semaine)' },
      { valeur: `${journal.filter((j) => j.details?.apres === 'suspendu').length}`, libelle: 'Rejetés (semaine)' },
    ];
    sources.heroStats = 'reel';
  } catch { sources.heroStats = 'absent'; }

  return { ...resultat, sources };
}

/*
  Décision de l'admin sur un fournisseur, via la fonction serveur
  admin_decider_fournisseur(p_id, p_statut, p_motif, p_badge) :
  - p_statut : 'publie' | 'en_attente' | 'suspendu'
  - un motif est OBLIGATOIRE pour suspendre (contrôle fait côté serveur aussi)
*/
export async function deciderFournisseur(id, statut, motif = null) {
  return rpc('admin_decider_fournisseur', { p_id: id, p_statut: statut, p_motif: motif });
}

/* ------------------------------------------ 4. écran « Modérateur » (n03) */

export async function chargerModerateur() {
  const sources = {};
  const resultat = {};

  const debutSemaine = depuis(new Date(Date.now() - 7 * JOUR));
  const debutJour = new Date(); debutJour.setHours(0, 0, 0, 0);
  const debutHier = new Date(debutJour.getTime() - JOUR);

  // --- Journée du modérateur = journal_admin
  try {
    const journal = await lignes('journal_admin', 'date_action, action, details, admin_id', (q) =>
      q.gte('date_action', depuis(new Date(Date.now() - 7 * JOUR))).order('date_action', { ascending: false })
    );
    const dans = (debut, fin) => journal.filter((j) => {
      const d = new Date(j.date_action);
      return d >= debut && (!fin || d < fin);
    }).length;
    const statuts = journal.filter((j) => j.action === 'fournisseur_statut');
    const valides = statuts.filter((j) => j.details?.apres === 'publie').length;
    const rejetes = statuts.filter((j) => j.details?.apres && j.details.apres !== 'publie').length;

    resultat.journee = {
      date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      aujourdhui: dans(debutJour),
      hier: dans(debutHier, debutJour),
      semaine: journal.length,
    };
    resultat.hero = {
      stats: [
        { valeur: `${valides}`, libelle: 'Validés (semaine)' },
        { valeur: `${rejetes}`, libelle: 'Rejetés (semaine)' },
        { valeur: `${statuts.length}`, libelle: 'Décisions (semaine)' },
      ],
    };
    sources.journee = 'reel';
    sources.hero = 'partiel';
  } catch { sources.journee = 'absent'; }

  // --- Dossier en cours = premier fournisseur en attente
  try {
    const [attente, documents] = await Promise.all([
      lignes('grossiste', 'id, nom, ville, pays, categorie, date_ajout, stock_confirme, description, badge_verifie', (q) =>
        q.eq('statut', 'en_attente').order('date_ajout', { ascending: true }).limit(1)),
      lignes('document_fournisseur', '*').catch(() => []),
    ]);
    const g = attente[0];
    if (g) {
      const docs = documents.filter((d) => d.grossiste_id === g.id);
      resultat.dossier = {
        id: g.id,
        nom: g.nom,
        resoumission: null, // pas connecté : pas d'historique de resoumission en base
        documents: docs.map((d) => d.type || '📄'),
        infos: [
          { libelle: 'Pays', valeur: [g.ville, g.pays].filter(Boolean).join(', ') || '—' },
          { libelle: 'Catégorie', valeur: g.categorie || '—' },
          { libelle: 'Stock déclaré', valeur: g.stock_confirme ? 'Confirmé' : 'Non confirmé' },
          { libelle: 'Recruté par', valeur: 'pas connecté' },
          { libelle: 'Soumis', valeur: ilYA(g.date_ajout) },
        ],
        checklist: [
          { libelle: "Pièces du dossier fournies", fait: docs.length > 0 },
          { libelle: 'Description renseignée', fait: Boolean(g.description) },
          { libelle: 'Stock confirmé', fait: Boolean(g.stock_confirme) },
        ],
      };
      sources.dossier = 'reel';
    } else {
      sources.dossier = 'absent';
    }
  } catch { sources.dossier = 'absent'; }

  // --- File d'attente + publiés
  try {
    const attente = await lignes('grossiste', 'id, date_ajout', (q) => q.eq('statut', 'en_attente'));
    const vieux = attente.filter((g) => Date.now() - new Date(g.date_ajout).getTime() > 2 * JOUR).length;
    const publies = await compter('grossiste', (q) => q.eq('statut', 'publie'));
    resultat.file = [
      { icone: '🏭', valeur: `${attente.length}`, libelle: 'Fournisseurs à vérifier', to: '/fournisseurs/en-attente' },
      { icone: '⏱️', valeur: `${vieux}`, libelle: '⚠ en attente depuis 48 h', urgent: vieux > 0, to: '/fournisseurs/en-attente' },
    ];
    resultat.publies = { valeur: `${publies}`, libelle: 'Fournisseurs publiés — rechercher pour suspendre si besoin', to: '/fournisseurs' };
    sources.file = 'reel';
    sources.publies = 'reel';
  } catch { sources.file = 'absent'; }

  // --- Sans source : pas de table des commerciaux terrain
  sources.commerciaux = 'absent';
  return { ...resultat, sources };
}

/* --------------------------------- 5. écran « Service client » (n04) */

export async function chargerServiceClient() {
  const sources = {};
  const resultat = {};

  let bord = null;
  try { bord = await rpc('admin_tableau_de_bord'); } catch { bord = null; }

  // --- File des litiges = affaires contestées, puis proposées
  try {
    const affaires = await lignes('affaire', 'id, grossiste_id, montant_fcfa, statut, date_declaration, conversation_id', (q) =>
      q.in('statut', ['contestee', 'proposee']).order('date_declaration', { ascending: false })
    );
    const grossistes = await lignes('grossiste', 'id, nom, ville, pays').catch(() => []);
    const enrichies = affaires.map((a) => {
      const g = grossistes.find((x) => x.id === a.grossiste_id);
      return {
        id: a.id,
        nom: g?.nom || 'Fournisseur inconnu',
        libelle: `${a.statut === 'contestee' ? 'Affaire contestée' : 'Affaire proposée'} — ${eurosFcfa(a.montant_fcfa)}`,
        montant: Number(a.montant_fcfa || 0),
        statut: a.statut,
        quand: ilYA(a.date_declaration),
        conversationId: a.conversation_id,
      };
    });
    resultat.affaires = enrichies;

    // --- Dossier de litige = la dernière affaire contestée
    const dossier = enrichies.find((a) => a.statut === 'contestee') || enrichies[0];
    if (dossier) {
      const messages = dossier.conversationId
        ? await lignes('message', 'id, expediteur, contenu, date_envoi, lu', (q) =>
            q.eq('conversation_id', dossier.conversationId).order('date_envoi', { ascending: true }).limit(20)
          ).catch(() => [])
        : [];
      const brut = affaires.find((a) => a.id === dossier.id);
      const g = grossistes.find((x) => x.id === brut?.grossiste_id);
      // Pièces jointes : les médias sont rattachés au fournisseur (table `media`)
      const medias = g
        ? await lignes('media', 'id, url, date_ajout', (q) => q.eq('grossiste_id', g.id).limit(20)).catch(() => [])
        : [];
      resultat.litige = {
        id: dossier.id,
        numero: `#${String(dossier.id).slice(0, 6)}`,
        origine: dossier.statut === 'contestee' ? 'Affaire contestée' : 'Affaire déclarée',
        acheteur: { nom: 'Acheteur (coordonnées protégées)', meta: 'Identité masquée côté admin' },
        fournisseur: { nom: g?.nom || dossier.nom, meta: [g?.ville, g?.pays].filter(Boolean).join(', ') || '—' },
        fil: messages.map((m) => ({
          de: m.expediteur === 'grossiste' ? (g?.nom || 'Fournisseur') : 'Acheteur',
          texte: m.contenu || '(message sans texte)',
        })),
        types: ['Paiement', 'Délai / stock', 'Autre'], // pas connecté : type de litige absent de la base
        preuves: medias.length,
        montant: dossier.montant,
      };
      sources.litige = 'partiel';
    } else {
      sources.litige = 'absent';
    }
    sources.affaires = 'reel';
  } catch { sources.affaires = 'absent'; sources.litige = 'absent'; }

  // --- Hero / persona
  try {
    const a = bord?.affaires || {};
    resultat.hero = {
      resume: `${Number(a.contestees || 0)} litige${Number(a.contestees || 0) > 1 ? 's' : ''} · ${Number(a.proposees || 0)} affaire(s) à confirmer`,
      stats: [
        { valeur: `${Number(a.proposees || 0)}`, libelle: 'En attente' },
        { valeur: `${Number(a.contestees || 0)}`, libelle: 'En cours' },
        { valeur: `${Number(a.confirmees || 0)}`, libelle: 'Résolues' },
      ],
    };
    sources.hero = 'reel';
  } catch { sources.hero = 'absent'; }

  // --- File des litiges « note faible » = avis <= 2
  try {
    const avis = await lignes('avis', 'id, grossiste_id, note, commentaire, date_creation, statut', (q) =>
      q.lte('note', 2).order('date_creation', { ascending: false }).limit(10)
    );
    const grossistes = await lignes('grossiste', 'id, nom').catch(() => []);
    resultat.fileLitiges = avis.map((a) => ({
      icone: '⭐',
      nom: grossistes.find((g) => g.id === a.grossiste_id)?.nom || 'Fournisseur',
      libelle: `Note ${a.note}★ — ${a.commentaire ? a.commentaire.slice(0, 60) : 'sans commentaire'}`,
      tag: 'Auto',
      quand: ilYA(a.date_creation),
    }));
    sources.fileLitiges = 'reel';
  } catch { sources.fileLitiges = 'absent'; }

  // --- Alertes stock = produits dont le stock n'est pas vérifié
  try {
    const produits = await lignes('produit', 'id, nom, grossiste_id, stock_disponible, stock_verifie_le, stock_maj_le, statut', (q) =>
      q.is('stock_verifie_le', null).order('date_ajout', { ascending: false }).limit(10)
    );
    const grossistes = await lignes('grossiste', 'id, nom').catch(() => []);
    resultat.alertesStock = produits.map((p) => ({
      icone: '📦',
      nom: grossistes.find((g) => g.id === p.grossiste_id)?.nom || 'Fournisseur',
      libelle: `${p.nom} — stock non vérifié${p.stock_maj_le ? ` (déclaré ${ilYA(p.stock_maj_le)})` : ''}`,
      urgent: Number(p.stock_disponible || 0) > 0,
    }));
    sources.alertesStock = 'reel';
  } catch { sources.alertesStock = 'absent'; }

  // --- Journée
  try {
    const journal = await lignes('journal_admin', 'date_action', (q) =>
      q.gte('date_action', depuis(new Date(Date.now() - 7 * JOUR)))
    );
    const debutJour = new Date(); debutJour.setHours(0, 0, 0, 0);
    const debutHier = new Date(debutJour.getTime() - JOUR);
    const dans = (debut, fin) => journal.filter((j) => {
      const d = new Date(j.date_action);
      return d >= debut && (!fin || d < fin);
    }).length;
    resultat.journee = {
      date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      aujourdhui: dans(debutJour),
      hier: dans(debutHier, debutJour),
      semaine: journal.length,
    };
    sources.journee = 'reel';
  } catch { sources.journee = 'absent'; }

  return { ...resultat, sources };
}

/* ----------------------------------- 6. écran « Demandes non couvertes » */

/*
  Arbitrage d'une affaire (litige) par l'admin :
  admin_trancher_affaire(p_id, p_statut, p_montant) — p_statut : 'confirmee' | 'annulee'.
  Confirmer crée la commission due ; annuler la retire. Journalisé automatiquement.
*/
export async function trancherAffaire(id, statut, montant = null) {
  return rpc('admin_trancher_affaire', { p_id: id, p_statut: statut, p_montant: montant });
}

export async function chargerRecherchesVides(jours = 30) {
  try {
    const vides = await rpc('admin_recherches_vides', { p_jours: jours });
    return { recherches: vides || [] };
  } catch {
    return { recherches: [], erreur: 'lecture impossible' };
  }
}

/* ------------------------------------------- 7. écran « Produits » */

/*
  Source : table `produit` (+ `produit_photo`), lisible publiquement
  (migrations 0005 pour les photos, 0007 pour le retrait des données privées).
  On lit donc de vrais produits sans compte admin.

  Colonnes réelles : nom, categorie, sous_categorie, statut, actif, prix_gros_fcfa,
  prix_unitaire_fcfa, moq, unite, stock_disponible, stock_verifie_le, stock_maj_le,
  grossiste_id, date_ajout, photo_url, motif_rejet.

  Décision de l'équipe sur le stock : verifier_stock_produit(id, vrai/faux) — migration 0009.
*/
const COLONNES_PRODUIT =
  'id, nom, categorie, sous_categorie, statut, actif, prix_gros_fcfa, prix_unitaire_fcfa, moq, unite, ' +
  'stock_disponible, stock_verifie_le, stock_maj_le, grossiste_id, date_ajout, photo_url, motif_rejet';

export async function chargerProduits({ statut = '', categorie = '', limite = 200 } = {}) {
  const produits = await lignes('produit', COLONNES_PRODUIT, (q) => {
    let r = q.order('date_ajout', { ascending: false }).limit(limite);
    if (statut) r = r.eq('statut', statut);
    if (categorie) r = r.eq('categorie', categorie);
    return r;
  });
  const grossistes = await lignes('grossiste', 'id, nom, ville, badge_verifie').catch(() => []);
  const parId = new Map(grossistes.map((g) => [g.id, g]));

  // Compteurs réels, statut par statut : rien n'est estimé.
  const publiesActifs = await compter('produit', (q) => q.eq('statut', 'publie').eq('actif', true)).catch(() => null);
  const enAttente = await compter('produit', (q) => q.eq('statut', 'en_attente')).catch(() => null);
  const rejetes = await compter('produit', (q) => q.eq('statut', 'rejete')).catch(() => null);
  const nonVerifies = await compter('produit', (q) =>
    q.eq('statut', 'publie').eq('actif', true).is('stock_verifie_le', null)
  ).catch(() => null);
  const total = await compter('produit', (q) => q).catch(() => null);

  return {
    produits: produits.map((p) => ({ ...p, fournisseur: parId.get(p.grossiste_id) || null })),
    compte: { total, publies: publiesActifs, en_attente: enAttente, rejetes, stock_non_verifie: nonVerifies },
    categories: [...new Set(produits.map((p) => p.categorie).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
  };
}

/* Vérifie (ou retire la vérification du) stock d'un produit — réservé à l'admin. */
export async function verifierStockProduit(id, verifie = true) {
  return rpc('verifier_stock_produit', { p_id: id, p_verifie: verifie });
}

/*
  Décision de l'équipe sur un produit en attente : publier ou rejeter.

  Deux chemins, dans cet ordre :
   1. moderer_produit(p_id, p_statut, p_motif) — c'est la fonction que l'écran de
      validation appelle déjà (src/api/admin.js). Elle n'apparaît PAS dans les
      migrations du dépôt : si la base ne la connaît pas, elle répond « function
      does not exist » et on passe au chemin 2.
   2. Mise à jour directe de `produit`, explicitement autorisée aux admins par le
      déclencheur produit_proteger_moderation : « Les admins (y compris via la
      fonction moderer_produit) gardent la main » (migration 0001). Le changement
      de statut est alors inscrit dans le journal d'audit par le déclencheur
      journal_produit (migration 0011).

  Sans session admin, les deux chemins sont refusés (42501) : l'écran affiche le
  refus, il ne prétend pas avoir publié.
*/
export async function deciderProduit(id, statut, motif = null) {
  try {
    await rpc('moderer_produit', { p_id: id, p_statut: statut, p_motif: motif });
    return 'moderer_produit';
  } catch (e) {
    const inconnue = /does not exist|schema cache|PGRST202|not find the function/i.test(String(e?.message || e));
    if (!inconnue) throw e;
  }
  const { error } = await supabase
    .from('produit')
    .update({ statut, motif_rejet: statut === 'rejete' ? motif : null })
    .eq('id', id);
  if (error) throw error;
  return 'mise a jour directe';
}

/* ------------------------------------------ 8. écran « Acheteurs » */

/*
  Source : admin_vendeurs() — migration 0010. La fonction rend la table `vendeur`
  en entier (nom, activité, téléphone, e-mail, pays, date d'inscription) ; la lecture
  directe de `vendeur` est refusée, seul l'administrateur passe par cette fonction.
  Un compte sans droit admin reçoit « permission denied » : l'écran le dit au lieu
  d'afficher des lignes inventées.
*/
export async function chargerAcheteurs() {
  const brut = await rpc('admin_vendeurs');
  const acheteurs = (brut || []).map((v) => ({
    id: v.id, nom: v.nom, activite: v.activite || null, pays: v.pays_code || null,
    telephone: v.telephone || null, email: v.email || null,
    inscription: v.date_inscription || null,
  }));
  const parPays = {};
  acheteurs.forEach((a) => { const p = a.pays || 'non précisé'; parPays[p] = (parPays[p] || 0) + 1; });
  const ilYA7j = new Date(Date.now() - 7 * JOUR).toISOString();
  return {
    acheteurs,
    compte: {
      total: acheteurs.length,
      nouveaux_7j: acheteurs.filter((a) => a.inscription && a.inscription >= ilYA7j).length,
      parPays,
    },
  };
}

/* ----------------------------------------- 9. écran « Catégories » */

/*
  Source : tables `categorie` (nom, ordre, active), `sous_categorie`
  (categorie_id, nom, ordre, active) et `pays_loohoo` (code, nom, dans, actif) —
  migrations 0013 et 0024, toutes lisibles sans compte admin.
  Renommage réservé à l'admin : admin_renommer_categorie / admin_renommer_sous_categorie.
*/
export async function chargerCategories() {
  const [cats, sous, pays, produits] = await Promise.all([
    lignes('categorie', 'id, nom, ordre, active', (q) => q.order('ordre')),
    lignes('sous_categorie', 'id, categorie_id, nom, ordre, active', (q) => q.order('ordre')),
    lignes('pays_loohoo', 'code, nom, dans, devise, indicatif, ordre, actif', (q) => q.order('ordre')).catch(() => []),
    lignes('produit', 'categorie, sous_categorie, statut, actif').catch(() => []),
  ]);

  // Comptage réel des produits par catégorie : on compte ce qu'on a lu, rien de plus.
  const publies = produits.filter((p) => p.statut === 'publie' && p.actif);
  const parCategorie = {};
  publies.forEach((p) => {
    const c = (p.categorie || 'sans catégorie').trim();
    parCategorie[c] = (parCategorie[c] || 0) + 1;
  });

  return {
    categories: cats.map((c) => ({
      ...c,
      produits: parCategorie[c.nom] || 0,
      sous: sous.filter((s) => s.categorie_id === c.id),
    })),
    orphelines: Object.keys(parCategorie).filter((n) => n !== 'sans catégorie' && !cats.some((c) => c.nom === n)),
    sansCategorie: parCategorie['sans catégorie'] || 0,
    pays: pays.map((p) => ({ ...p, produits: null })),
    compteProduits: publies.length,
  };
}

/* Renommage (propagation sur les produits et fournisseurs) — réservé à l'admin. */
export async function renommerCategorie(ancien, nouveau) {
  return rpc('admin_renommer_categorie', { p_ancien: ancien, p_nouveau: nouveau });
}

export async function renommerSousCategorie(categorie, ancien, nouveau) {
  return rpc('admin_renommer_sous_categorie', { p_categorie: categorie, p_ancien: ancien, p_nouveau: nouveau });
}

/* ------------------------------ 10. écran « Avis des acheteurs » */

/*
  Source : admin_liste_avis(p_statut) — migration 0016, fonction d'administration.
  Un avis n'est visible publiquement qu'après validation par l'équipe : l'écran sert
  exactement à cette décision (admin_moderer_avis : publier ou refuser, motif si refus).
*/
export async function chargerAvis(statut = 'en_attente') {
  const brut = await rpc('admin_liste_avis', { p_statut: statut });
  const liste = (brut || []).map((a) => ({
    id: a.id,
    note: a.note,
    commentaire: a.commentaire || '',
    statut: a.statut,
    motif_rejet: a.motif_rejet || null,
    quand: a.date_creation || null,
    modere: a.date_moderation || null,
    fournisseur: a.grossiste_nom || a.grossiste?.nom || null,
    acheteur: a.vendeur_nom || a.vendeur?.nom || null,
  }));
  const parNote = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  liste.forEach((a) => { if (a.note >= 1 && a.note <= 5) parNote[a.note] += 1; });
  const moyenne = liste.length
    ? (liste.reduce((n, a) => n + (Number(a.note) || 0), 0) / liste.length).toFixed(1).replace('.', ',')
    : '—';
  return { avis: liste, statut, compte: { total: liste.length, parNote, moyenne } };
}

export async function modererAvis(id, publier, motif = null) {
  return rpc('admin_moderer_avis', { p_id: id, p_publier: publier, p_motif: motif });
}

/* --------------------------------------- 11. écran « Conversations » */

/*
  Source : tables `conversation` et `message` (réservées à l'admin).
  Colonnes réelles : conversation — id, derniere_activite, grossiste_id, vendeur_id,
  produit_id ; message — id, conversation_id, expediteur ('vendeur' | 'fournisseur'),
  contenu, date_envoi, lu.
  Il n'existe AUCUNE colonne de statut de conversation ni de « conclue » dans le
  schéma : l'écran ne l'invente pas, il marque ces cases « pas connecté ».
  État « traité » d'un message signalé : admin_marquer_message_traite — migration 0011.
*/
export async function chargerConversations(limite = 60) {
  const conversations = await lignes(
    'conversation',
    'id, derniere_activite, produit_id, grossiste(id, nom, ville), vendeur(id, nom, activite)',
    (q) => q.order('derniere_activite', { ascending: false }).limit(limite)
  );
  const ids = conversations.map((c) => c.id);
  const messages = ids.length
    ? await lignes('message', 'id, conversation_id, expediteur, contenu, date_envoi, lu, signale, signale_traite',
      (q) => q.in('conversation_id', ids).order('date_envoi', { ascending: true })).catch(() => [])
    : [];
  const parConversation = new Map();
  messages.forEach((m) => {
    if (!parConversation.has(m.conversation_id)) parConversation.set(m.conversation_id, []);
    parConversation.get(m.conversation_id).push(m);
  });
  const liste = conversations.map((c) => {
    const msgs = parConversation.get(c.id) || [];
    const repondu = msgs.some((m) => m.expediteur === 'fournisseur');
    const signales = msgs.filter((m) => m.signale && !m.signale_traite).length;
    return {
      id: c.id,
      quand: c.derniere_activite,
      fournisseur: c.grossiste || null,
      acheteur: c.vendeur || null,
      messages: msgs,
      nbMessages: msgs.length,
      repondu,            // lu dans message.expediteur : vrai renseignement
      signales,
      statut: null,       // aucune colonne de statut en base : « pas connecté »
    };
  });
  return {
    conversations: liste,
    compte: {
      total: liste.length,
      sansReponse: liste.filter((c) => !c.repondu).length,
      signales: liste.reduce((n, c) => n + c.signales, 0),
    },
  };
}

export async function marquerMessageTraite(id, traite = true) {
  return rpc('admin_marquer_message_traite', { p_id: id, p_traite: traite });
}

/* Résumé lisible de l'origine des blocs, pour le bandeau en haut d'écran. */
export function resumeSources(sources = {}) {
  const reels = [];
  const absents = [];
  Object.entries(sources).forEach(([bloc, etat]) => {
    if (etat === 'reel') reels.push(bloc);
    else if (etat === 'partiel') reels.push(`${bloc} (partiel)`);
    else absents.push(bloc);
  });
  const parties = [];
  if (reels.length) parties.push(`Branché sur la base LOOHOO : ${reels.join(', ')}.`);
  if (absents.length) parties.push(`Sans source — pas connecté : ${absents.join(', ')}.`);
  if (!parties.length) parties.push('Aucune donnée chargée pour le moment.');
  return parties.join(' ');
}

export { MOIS, ilYA, eurosFcfa };
