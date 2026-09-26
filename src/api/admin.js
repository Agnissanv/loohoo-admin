import { supabase } from '../supabaseClient.js';

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

export async function recupererFournisseurs() {
  const { data, error } = await supabase
    .from('grossiste')
    .select(`
      id, nom, categorie, ville, commune, statut, badge_verifie, stock_confirme, est_fabricant, date_ajout,
      grossiste_contact(telephone),
      grossiste_photo(id, url),
      produit(id, nom, prix_gros_fcfa, moq)
    `)
    .order('date_ajout', { ascending: false });
  if (error) throw error;
  return data;
}

export async function changerStatut(id, statut) {
  const { error } = await supabase.from('grossiste').update({ statut }).eq('id', id);
  if (error) throw error;
}

export async function changerBadgeVerifie(id, badge_verifie) {
  const { error } = await supabase.from('grossiste').update({ badge_verifie }).eq('id', id);
  if (error) throw error;
}

export async function recupererStats() {
  const { data, error } = await supabase.rpc('stats_fournisseurs');
  if (error) throw error;
  return data;
}


export async function recupererStatsBoutiques(token) {
  const reponse = await fetch('/api/boutiques-stats', { headers: { Authorization: `Bearer ${token}` } });
  if (!reponse.ok) throw new Error("Impossible de charger les statistiques des boutiques.");
  return reponse.json();
}