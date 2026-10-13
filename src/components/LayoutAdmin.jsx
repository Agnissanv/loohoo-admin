import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Factory, Handshake, Home, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, ScrollText, Settings, Star, Store, Tags, Users, X,
} from 'lucide-react';
import { deconnecterAdmin, suivreSession, estAdmin, estSuperAdmin, tableauDeBord, recupererAvis } from '../api/admin.js';
import { initiales } from '../utils/format.js';

// Deux espaces distincts, pour que l'administrateur sache toujours où il est :
//   Fournisseurs (/f) : la plateforme de sourcing B2B       Boutiques (/b) : la plateforme de création de boutiques
// Les pages communes (accueil, journal d'audit, équipe) sont accessibles depuis les deux.
const LIENS_FOURNISSEURS = [
  { vers: '/f', texte: 'Tableau de bord', icone: LayoutDashboard, fin: true },
  { vers: '/f/a-traiter', texte: 'À traiter', icone: ClipboardCheck, pastille: true },
  { vers: '/f/fournisseurs', texte: 'Fournisseurs', icone: Factory },
  { vers: '/f/produits', texte: 'Produits', icone: Package },
  { vers: '/f/acheteurs', texte: 'Acheteurs', icone: Users },
  { vers: '/f/conversations', texte: 'Conversations', icone: MessageSquare },
  { vers: '/f/affaires', texte: 'Affaires et commissions', icone: Handshake },
  { vers: '/f/avis', texte: 'Avis des acheteurs', icone: Star, pastilleAvis: true },
  { vers: '/f/leads', texte: 'Leads des acheteurs', icone: Mail },
  { vers: '/f/categories', texte: 'Catégories', icone: Tags, superSeulement: true },
];
const LIENS_BOUTIQUES = [
  { vers: '/b', texte: 'Tableau de bord', icone: LayoutDashboard, fin: true },
  { vers: '/b/boutiques', texte: 'Boutiques connectées', icone: Store },
  { vers: '/b/leads', texte: "Demandes d'ouverture", icone: Mail },
];
const LIENS_GENERAUX = [
  { vers: '/', texte: 'Accueil', icone: Home, fin: true },
  { vers: '/journal', texte: "Journal d'audit", icone: ScrollText },
  { vers: '/equipe', texte: 'Équipe', icone: Settings, superSeulement: true },
];

const espaceDe = (pathname) => (/^\/f(\/|$)/.test(pathname) ? 'fournisseurs' : /^\/b(\/|$)/.test(pathname) ? 'boutiques' : 'general');

// Cadre de l'administration : accès réservé aux comptes de la table admins
export default function LayoutAdmin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [session, setSession] = useState(undefined);
  const [autorise, setAutorise] = useState(undefined);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [compteurs, setCompteurs] = useState(null);
  const [avisAttente, setAvisAttente] = useState(0);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => suivreSession(setSession), []);

  useEffect(() => {
    if (session === undefined) return;
    if (session === null) { navigate('/connexion'); return; }
    estAdmin().then(setAutorise).catch(() => setAutorise(false));
    estSuperAdmin().then(setSuperAdmin);
  }, [session, navigate]);

  const rafraichir = useCallback(() => {
    // Les avis en attente : sans effet tant que la migration 0016 n'est pas exécutée
    recupererAvis().then((l) => setAvisAttente(l.filter((a) => a.statut === 'en_attente').length)).catch(() => setAvisAttente(0));
    return tableauDeBord().then(setCompteurs).catch(() => {});
  }, []);

  useEffect(() => { if (autorise) rafraichir(); }, [autorise, rafraichir, pathname]);
  useEffect(() => setMenuOuvert(false), [pathname]);

  if (session === undefined || autorise === undefined) {
    return <div className="container" style={{ padding: '3rem 1.5rem' }}><div className="loo-squelette" style={{ height: '240px' }} /></div>;
  }
  if (!session) return null;
  if (autorise === false) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '520px' }}>
          <h1 className="section-titre">Accès refusé</h1>
          <p>Ce compte ({session.user.email}) n'a pas les droits d'administration.</p>
          <button type="button" className="btn btn-outline" onClick={() => deconnecterAdmin().then(() => navigate('/connexion'))}>Se déconnecter</button>
        </div>
      </section>
    );
  }

  const espace = espaceDe(pathname);
  const aTraiter = compteurs
    ? compteurs.fournisseurs.en_attente + compteurs.produits.en_attente + compteurs.documents_en_attente + compteurs.messages.signales + (compteurs.affaires?.contestees || 0)
    : 0;
  const liensEspace = espace === 'fournisseurs' ? LIENS_FOURNISSEURS : espace === 'boutiques' ? LIENS_BOUTIQUES : [];
  const visible = (lien) => !lien.superSeulement || superAdmin;

  const lienMenu = ({ vers, texte, icone: Icone, pastille, pastilleAvis, fin }) => (
    <NavLink key={vers} to={vers} end={fin} className={({ isActive }) => `esp-lien${isActive ? ' esp-lien-actif' : ''}`}>
      <Icone size={19} /> {texte}
      {pastilleAvis && avisAttente > 0 && <span className="esp-pastille">{avisAttente > 99 ? '99+' : avisAttente}</span>}
      {pastille && aTraiter > 0 && <span className="esp-pastille">{aTraiter > 99 ? '99+' : aTraiter}</span>}
    </NavLink>
  );

  const selecteur = (classe) => (
    <div className={classe} role="tablist" aria-label="Espace d'administration">
      <Link to="/f" role="tab" aria-selected={espace === 'fournisseurs'} className={`esp-espace${espace === 'fournisseurs' ? ' esp-espace-actif' : ''}`}>
        <Factory size={16} /> Fournisseurs {aTraiter > 0 && <span className="esp-pastille" style={{ position: 'static' }}>{aTraiter > 99 ? '99+' : aTraiter}</span>}
      </Link>
      <Link to="/b" role="tab" aria-selected={espace === 'boutiques'} className={`esp-espace esp-espace-boutiques${espace === 'boutiques' ? ' esp-espace-actif' : ''}`}>
        <Store size={16} /> Boutiques
      </Link>
    </div>
  );

  return (
    <div className={`esp esp-${espace}${menuOuvert ? ' esp-menu-ouvert' : ''}`}>
      <header className="esp-haut">
        <div className="esp-marque">
          <button type="button" className="esp-bouton-icone esp-burger" onClick={() => setMenuOuvert((o) => !o)} aria-label="Ouvrir le menu">
            {menuOuvert ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.jpeg" alt="" width="34" height="34" />
            <span className="esp-marque-nom">LOOHOO</span>
          </Link>
          <span className="esp-marque-sep" />
          <span className="esp-marque-titre">Administration</span>
        </div>
        {selecteur('esp-espaces esp-espaces-haut')}
        <div className="esp-haut-droite">
          <span className="esp-puce esp-puce-neutre esp-role" title="Votre rôle">{superAdmin ? 'Super-admin' : 'Modérateur'}</span>
          <span className="esp-avatar" title={session.user.email}>{initiales(session.user.email)}</span>
          <button type="button" className="esp-bouton-icone" aria-label="Se déconnecter" title="Se déconnecter" onClick={() => deconnecterAdmin().then(() => navigate('/connexion'))}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="esp-corps">
        <nav className="esp-menu" aria-label="Administration">
          {selecteur('esp-espaces esp-espaces-menu')}
          {espace !== 'general' && <div className="esp-menu-titre">{espace === 'fournisseurs' ? 'Espace Fournisseurs' : 'Espace Boutiques'}</div>}
          {liensEspace.filter(visible).map(lienMenu)}
          <div className="esp-menu-bas">
            <div className="esp-menu-titre">Général</div>
            {LIENS_GENERAUX.filter(visible).map(lienMenu)}
          </div>
        </nav>
        <div className="esp-voile" onClick={() => setMenuOuvert(false)} />
        <main className="esp-contenu">
          <Outlet context={{ compteurs, rafraichir, superAdmin }} />
        </main>
      </div>
    </div>
  );
}
