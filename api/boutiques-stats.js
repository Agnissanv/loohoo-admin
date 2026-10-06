import { createClient } from '@supabase/supabase-js';

async function verifierAdmin(token) {
  if (!token) return false;
  const admin = createClient(
    process.env.FOURNISSEURS_SUPABASE_URL,
    process.env.FOURNISSEURS_SERVICE_ROLE_KEY
  );
  const { data: utilisateur, error } = await admin.auth.getUser(token);
  if (error || !utilisateur?.user) return false;
  const { data } = await admin.from('admins').select('user_id').eq('user_id', utilisateur.user.id).maybeSingle();
  return !!data;
}

// Registre des boutiques : chaque entrée pointe vers les variables d'environnement
// qui contiennent l'URL et la clé de service de SON PROPRE Supabase (jamais partagé).
const BOUTIQUES = [
  { id: 'medithe', nom: 'MédiThé', urlEnv: 'MEDITHE_SUPABASE_URL', cleEnv: 'MEDITHE_SUPABASE_SERVICE_ROLE_KEY' },
];

const STATUTS_EXCLUS_CA = ['Annulé / Rejeté', 'Client oiseau', 'Injoignable', 'Échec de livraison'];

async function statsBoutique(b) {
  const url = process.env[b.urlEnv];
  const cle = process.env[b.cleEnv];
  if (!url || !cle) return { id: b.id, nom: b.nom, erreur: 'Variables manquantes' };

  const entetes = { apikey: cle, Authorization: `Bearer ${cle}` };
  try {
    const [produitsRes, commandesRes] = await Promise.all([
      fetch(`${url}/rest/v1/produits?select=id&disponible=eq.true`, { headers: { ...entetes, Prefer: 'count=exact' } }),
      fetch(`${url}/rest/v1/commandes?select=montant_total,statut`, { headers: entetes }),
    ]);
    const nbProduits = Number(produitsRes.headers.get('content-range')?.split('/')[1] || 0);
    const commandes = await commandesRes.json();
    const valides = Array.isArray(commandes) ? commandes.filter((c) => !STATUTS_EXCLUS_CA.includes(c.statut)) : [];
    const chiffreAffaires = valides.reduce((total, c) => total + Number(c.montant_total || 0), 0);
    return { id: b.id, nom: b.nom, nbProduits, nbCommandes: valides.length, chiffreAffaires };
  } catch {
    return { id: b.id, nom: b.nom, erreur: 'Boutique injoignable' };
  }
}

export default async function handler(req, res) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!(await verifierAdmin(token))) {
    res.status(403).json({ erreur: 'Accès refusé' });
    return;
  }
  const resultats = await Promise.all(BOUTIQUES.map(statsBoutique));
  res.setHeader('Cache-Control', 's-maxage=60');
  res.status(200).json(resultats);
}