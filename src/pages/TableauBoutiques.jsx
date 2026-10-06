import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, ExternalLink, Store } from 'lucide-react';
import { recupererLeads, recupererStatsBoutiques } from '../api/admin.js';
import { supabase } from '../supabaseClient.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { formatDateHeure, formatPrix } from '../utils/format.js';

const dateDe = (l) => l.date || l.created_at || l.date_creation || null;

// Ce qui est prévu pour la plateforme Boutiques : affiché honnêtement comme « à venir », sans chiffres inventés
const FEUILLE_DE_ROUTE = [
  ['Boutiques existantes rattachées à LOOHOO (MédiThé)', true],
  ['Collecte des e-mails de ceux qui veulent ouvrir une boutique', true],
  ['Création de boutique en libre-service', false],
  ['Abonnements et facturation', false],
  ['Validation et modération des nouvelles boutiques', false],
  ['Sous-domaines des boutiques et suivi des paiements', false],
];

export default function TableauBoutiques() {
  const boutiques = useAdminDonnees(() => supabase.auth.getSession().then(({ data }) => recupererStatsBoutiques(data.session.access_token)));
  const leads = useAdminDonnees(recupererLeads);

  const demandes = (leads.donnees || [])
    .filter((l) => String(l.recherche || '').startsWith('landing-'))
    .sort((a, b) => new Date(dateDe(b) || 0) - new Date(dateDe(a) || 0));
  const valides = (boutiques.donnees || []).filter((b) => !b.erreur);
  const somme = (cle) => valides.reduce((n, b) => n + Number(b[cle] || 0), 0);

  return (
    <>
      <div className="esp-bandeau">
        <div>
          <h1>Espace Boutiques</h1>
          <p>La plateforme de création de boutiques en ligne est en préparation. Vous suivez ici les boutiques déjà rattachées et les personnes qui veulent en ouvrir une.</p>
        </div>
        <div className="esp-kpis">
          <Kpi etiquette="Boutiques connectées" valeur={boutiques.donnees === undefined ? '…' : valides.length} />
          <Kpi etiquette="Commandes" valeur={boutiques.donnees === undefined ? '…' : somme('nbCommandes')} />
          <Kpi etiquette="Chiffre d'affaires" valeur={boutiques.donnees === undefined ? '…' : formatPrix(somme('chiffreAffaires'))} petit />
          <Kpi etiquette="Demandes d'ouverture" valeur={leads.donnees === undefined ? '…' : demandes.length} />
        </div>
      </div>

      <div className="esp-grille esp-deux" style={{ marginTop: '1rem', alignItems: 'start' }}>
        <div className="esp-carte">
          <h2 className="esp-carte-titre"><span>Boutiques connectées</span><Link to="/b/boutiques">Détails →</Link></h2>
          {boutiques.donnees === undefined && <div className="loo-squelette" style={{ height: 70 }} />}
          {boutiques.erreur && <p className="esp-aide">Statistiques indisponibles pour le moment.</p>}
          {boutiques.donnees && boutiques.donnees.length === 0 && <p className="esp-aide">Aucune boutique rattachée.</p>}
          {(boutiques.donnees || []).map((b) => (
            <div key={b.id} className="esp-liste-ligne">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}><Store size={18} color="var(--loo-rouge)" /><strong>{b.nom}</strong></span>
              {b.erreur
                ? <span className="esp-puce esp-puce-rouge">{b.erreur}</span>
                : <span className="esp-aide">{b.nbProduits} produits · {b.nbCommandes} commandes · {formatPrix(b.chiffreAffaires)}</span>}
            </div>
          ))}
        </div>

        <div className="esp-carte">
          <h2 className="esp-carte-titre"><span>Avancement de la plateforme</span><span className="esp-puce esp-puce-orange">En préparation</span></h2>
          {FEUILLE_DE_ROUTE.map(([texte, fait]) => (
            <div key={texte} className="esp-liste-ligne">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', opacity: fait ? 1 : 0.7 }}>
                {fait ? <Check size={17} color="#1f7a3d" /> : <Circle size={17} opacity={0.4} />} {texte}
              </span>
              <span className={`esp-puce ${fait ? 'esp-puce-vert' : 'esp-puce-neutre'}`}>{fait ? 'En place' : 'À venir'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="esp-carte" style={{ marginTop: '1rem' }}>
        <h2 className="esp-carte-titre"><span>Dernières demandes d'ouverture</span><Link to="/b/leads">Toutes →</Link></h2>
        {leads.donnees === undefined && <div className="loo-squelette" style={{ height: 60 }} />}
        {leads.donnees && demandes.length === 0 && <p className="esp-aide">Aucune demande pour l'instant. Elles arrivent depuis le bouton « Vendre en ligne » de looh-oo.com.</p>}
        {demandes.slice(0, 5).map((l, i) => (
          <div key={l.id ?? i} className="esp-liste-ligne"><strong style={{ fontSize: '0.92rem' }}>{l.email}</strong><span className="esp-aide">{formatDateHeure(dateDe(l))}</span></div>
        ))}
      </div>

      <p className="esp-aide" style={{ marginTop: '1rem' }}>
        <ExternalLink size={13} style={{ verticalAlign: '-2px' }} /> Chaque boutique garde sa propre interface d'administration ; cet espace n'en est qu'un aperçu en lecture.
      </p>
    </>
  );
}

function Kpi({ etiquette, valeur, petit }) {
  return <div className="esp-kpi"><div className="esp-kpi-etiquette">{etiquette}</div><div className="esp-kpi-valeur" style={petit ? { fontSize: '1.05rem' } : undefined}>{valeur}</div></div>;
}
