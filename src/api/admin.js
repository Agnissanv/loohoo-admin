import { supabase } from '../supabaseClient.js';

// ---- Session ----
export async function connecterAdmin(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function deconnecterAdmin() {
  await supabase.auth.signOut();
}

export function suivreSession(callback) {
  supabase.auth.getSession().then(({ data }) => callback(data.session));
  const { data: abonnement } = supabase.auth.onAuthStateChange((_evt, session) => callback(session));
  return () => abonnement.subscription.unsubscribe();
}

// true / false / null (session pas encore connue)
export async function estAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) throw error;
  return data;
}

// Vrai pour un super-administrateur (migration 0013). Avant cette migration, tous les administrateurs gardent leurs droits actuels.
export async function estSuperAdmin() {
  const { data, error } = await supabase.rpc('is_super_admin');
  if (error) return true;
  return !!data;
}

// La base renvoie la ligne de contact tantôt en liste, tantôt en objet seul (un seul contact par fournisseur)
export function contactDe(fournisseur) {
  const brut = fournisseur?.grossiste_contact;
  return (Array.isArray(brut) ? brut[0] : brut) || {};
}

// ---- Tableau de bord ----
export async function tableauDeBord() {
  const { data, error } = await supabase.rpc('admin_tableau_de_bord');
  if (error) throw error;
  return data;
}

// ---- Fournisseurs ----
export async function recupererFournisseurs() {
  const { data, error } = await supabase
    .from('grossiste')
    .select(`
      id, nom, categorie, ville, commune, statut, badge_verifie, stock_confirme, est_fabricant, date_ajout, drapeau_coordonnees,
      grossiste_contact(telephone),
      grossiste_photo(id),
      produit(id, statut)
    `)
    .order('date_ajout', { ascending: false });
  if (error) throw error;
  return data;
}

// Fiche complète : tout ce que l'équipe doit voir pour décider
export async function recupererFournisseurComplet(id) {
  const { data, error } = await supabase
    .from('grossiste')
    .select('*, grossiste_contact(*), grossiste_photo(*), produit(*), document_fournisseur(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Motif de la dernière décision sur un fournisseur (vide si aucun ou si la migration 0014 n'est pas passée)
export async function recupererMotifDecision(id) {
  const { data, error } = await supabase.from('grossiste_decision').select('motif').eq('grossiste_id', id).maybeSingle();
  if (error) return '';
  return data?.motif || '';
}

export async function deciderFournisseur(id, statut, motif = null, badge = null) {
  const { error } = await supabase.rpc('admin_decider_fournisseur', { p_id: id, p_statut: statut, p_motif: motif, p_badge: badge });
  if (error) throw error;
}

// ---- Produits ----
export async function recupererProduits() {
  const { data, error } = await supabase
    .from('produit')
    .select('id, nom, description, tags, categorie, prix_gros_fcfa, moq, stock_disponible, unite, statut, actif, motif_rejet, drapeau_coordonnees, stock_verifie_le, photo_url, date_ajout, grossiste(id, nom, badge_verifie)')
    .order('date_ajout', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function modererProduit(id, statut, motif = null) {
  const { error } = await supabase.rpc('moderer_produit', { p_id: id, p_statut: statut, p_motif: motif });
  if (error) throw error;
}

export async function verifierStock(id, verifie = true) {
  const { error } = await supabase.rpc('verifier_stock_produit', { p_id: id, p_verifie: verifie });
  if (error) throw error;
}

// ---- Documents ----
export async function recupererDocumentsEnAttente() {
  const { data, error } = await supabase
    .from('document_fournisseur')
    .select('id, type, nom_fichier, chemin, statut, grossiste(id, nom)')
    .eq('statut', 'en_attente');
  if (error) throw error;
  return data;
}

export async function deciderDocument(id, statut, motif = null) {
  const { error } = await supabase.rpc('admin_decider_document', { p_id: id, p_statut: statut, p_motif: motif });
  if (error) throw error;
}

// Lien temporaire (10 minutes) vers un document privé
export async function lienDocument(chemin) {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(chemin, 600);
  if (error) throw error;
  return data.signedUrl;
}

// ---- Acheteurs ----
export async function recupererAcheteurs() {
  const { data, error } = await supabase.rpc('admin_vendeurs');
  if (error) throw error;
  return data;
}

// ---- Conversations et messages ----
export async function recupererConversations() {
  const { data, error } = await supabase
    .from('conversation')
    .select('id, derniere_activite, vendeur(id, nom, activite), grossiste(id, nom), produit(id, nom), message(id, contenu, expediteur, date_envoi, signale, signale_traite)')
    .order('derniere_activite', { ascending: false })
    .limit(300);
  if (error) throw error;
  return data;
}

// Messages signalés (coordonnées détectées) et texte d'origine avant masquage
export async function recupererMessagesSignales() {
  const { data, error } = await supabase
    .from('message')
    .select('id, contenu, expediteur, date_envoi, signale_traite, conversation(id, vendeur(nom), grossiste(id, nom))')
    .eq('signale', true)
    .eq('signale_traite', false)
    .order('date_envoi', { ascending: false })
    .limit(100);
  if (error) throw error;
  const ids = data.map((m) => String(m.id));
  let originaux = {};
  if (ids.length) {
    const { data: masques } = await supabase.from('message_masque').select('message_id, contenu_original, motifs').in('message_id', ids);
    originaux = Object.fromEntries((masques || []).map((m) => [m.message_id, m]));
  }
  return data.map((m) => ({ ...m, original: originaux[String(m.id)] || null }));
}

// Textes d'origine (avant masquage) d'une liste de messages : { idMessage: { contenu_original, motifs } }
export async function recupererOriginauxMessages(ids) {
  const { data, error } = await supabase.from('message_masque').select('message_id, contenu_original, motifs').in('message_id', ids.map(String));
  if (error) throw error;
  return Object.fromEntries((data || []).map((m) => [m.message_id, m]));
}

export async function marquerMessageTraite(id, traite = true) {
  const { error } = await supabase.rpc('admin_marquer_message_traite', { p_id: id, p_traite: traite });
  if (error) throw error;
}

// ---- Notes internes ----
export async function recupererNotes(type, id) {
  const { data, error } = await supabase.from('note_admin').select('id, texte, date_note').eq('cible_type', type).eq('cible_id', String(id)).order('date_note', { ascending: false });
  if (error) throw error;
  return data;
}

export async function ajouterNote(type, id, texte) {
  const { error } = await supabase.from('note_admin').insert({ cible_type: type, cible_id: String(id), texte: texte.trim() });
  if (error) throw error;
}

export async function supprimerNote(id) {
  const { error } = await supabase.from('note_admin').delete().eq('id', id);
  if (error) throw error;
}

// ---- Affaires conclues et commissions (migration 0012) ----
export async function recupererAffaires() {
  const { data, error } = await supabase.from('affaire').select('*, commission(*)').order('date_declaration', { ascending: false }).limit(500);
  if (error) throw error;
  return data;
}

export async function trancherAffaire(id, statut, montant = null) {
  const { error } = await supabase.rpc('admin_trancher_affaire', { p_id: id, p_statut: statut, p_montant: montant });
  if (error) throw error;
}

export async function statutCommission(affaireId, statut, note = null) {
  const { error } = await supabase.rpc('admin_statut_commission', { p_affaire_id: affaireId, p_statut: statut, p_note: note });
  if (error) throw error;
}

export async function definirTaux(pourcent) {
  const { error } = await supabase.rpc('admin_definir_taux', { p_pourcent: pourcent });
  if (error) throw error;
}

// ---- Équipe d'administration (super-administrateur) ----
export async function listeAdmins() {
  const { data, error } = await supabase.rpc('admin_liste_admins');
  if (error) throw error;
  return data;
}
export async function ajouterAdmin(email, role) {
  const { error } = await supabase.rpc('admin_ajouter_admin', { p_email: email, p_role: role });
  if (error) throw error;
}
export async function changerRoleAdmin(userId, role) {
  const { error } = await supabase.rpc('admin_changer_role', { p_user_id: userId, p_role: role });
  if (error) throw error;
}
export async function retirerAdmin(userId) {
  const { error } = await supabase.rpc('admin_retirer_admin', { p_user_id: userId });
  if (error) throw error;
}

// ---- Catégories (super-administrateur) ----
export async function recupererCategories() {
  const { data, error } = await supabase.from('categorie').select('id, nom, ordre, active, sous_categorie(id, nom, ordre, active)').order('ordre');
  if (error) throw error;
  return data.map((c) => ({ ...c, sous_categorie: [...(c.sous_categorie || [])].sort((a, b) => a.ordre - b.ordre) }));
}
export async function creerCategorie(nom, ordre) {
  const { error } = await supabase.from('categorie').insert({ nom: nom.trim(), ordre });
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'Cette catégorie existe déjà.' : error.message);
}
export async function majCategorie(id, champs) {
  const { error } = await supabase.from('categorie').update(champs).eq('id', id);
  if (error) throw error;
}
export async function renommerCategorie(ancien, nouveau) {
  const { error } = await supabase.rpc('admin_renommer_categorie', { p_ancien: ancien, p_nouveau: nouveau });
  if (error) throw error;
}
export async function creerSousCategorie(categorieId, nom, ordre) {
  const { error } = await supabase.from('sous_categorie').insert({ categorie_id: categorieId, nom: nom.trim(), ordre });
  if (error) throw new Error(/duplicate|unique/i.test(error.message) ? 'Cette sous-catégorie existe déjà.' : error.message);
}
export async function majSousCategorie(id, champs) {
  const { error } = await supabase.from('sous_categorie').update(champs).eq('id', id);
  if (error) throw error;
}
export async function renommerSousCategorie(categorie, ancien, nouveau) {
  const { error } = await supabase.rpc('admin_renommer_sous_categorie', { p_categorie: categorie, p_ancien: ancien, p_nouveau: nouveau });
  if (error) throw error;
}

// ---- Leads ----
export async function recupererLeads() {
  const { data, error } = await supabase.from('lead').select('*');
  if (error) throw error;
  return data;
}

// ---- Journal d'audit ----
export async function recupererJournal(limite = 200) {
  const { data, error } = await supabase.from('journal_admin').select('*').order('date_action', { ascending: false }).limit(limite);
  if (error) throw error;
  return data;
}

// Historique des décisions concernant un fournisseur, un produit ou un document
export async function recupererJournalCible(type, id) {
  const { data, error } = await supabase.from('journal_admin').select('*').eq('cible_type', type).eq('cible_id', String(id)).order('date_action', { ascending: false }).limit(50);
  if (error) throw error;
  return data;
}

// ---- Boutiques (pont serveur vers MédiThé) ----
export async function recupererStatsBoutiques(token) {
  const reponse = await fetch('/api/boutiques-stats', { headers: { Authorization: `Bearer ${token}` } });
  if (!reponse.ok) throw new Error('Impossible de charger les statistiques des boutiques.');
  return reponse.json();
}

// ---- Avis des acheteurs (migration 0016) ----
export async function recupererAvis() {
  const { data, error } = await supabase.rpc('admin_liste_avis', { p_statut: null });
  if (error) throw error;
  return data;
}

export async function modererAvis(id, publier, motif = null) {
  const { error } = await supabase.rpc('admin_moderer_avis', { p_id: id, p_publier: publier, p_motif: motif });
  if (error) throw error;
}
