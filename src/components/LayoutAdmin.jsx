import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Factory, Handshake, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, ScrollText, Settings, Store, Tags, Users, X,
} from 'lucide-react';
import { deconnecterAdmin, suivreSession, estAdmin, estSuperAdmin, tableauDeBord } from '../api/admin.js';
import { initiales } from '../utils/format.js';

const LIENS = [
  { vers: '/', texte: 'Tableau de bord', icone: LayoutDashboard, fin: true },
  { vers: '/a-traiter', texte: 'À traiter', icone: ClipboardCheck, pastille: true },
  { vers: '/fournisseurs', texte: 'Fournisseurs', icone: Factory },
  { vers: '/produits', texte: 'Produits', icone: Package },
  { vers: '/acheteurs', texte: 'Acheteurs', icone: Users },
  { vers: '/conversations', texte: 'Conversations', icone: MessageSquare },
  { vers: '/affaires', texte: 'Affaires et commissions', icone: Handshake },
  { vers: '/leads', texte: 'Leads', icone: Mail },
  { vers: '/boutiques', texte: 'Boutiques', icone: Store },
  { vers: '/journal', texte: "Journal d'audit", icone: ScrollText },
  { vers: '/categories', texte: 'Catégories', icone: Tags, superSeulement: true },
  { vers: '/equipe', texte: 'Équipe', icone: Settings, superSeulement: true },
];

// Cadre de l'administration : accès réservé aux comptes de la table admins
export default function LayoutAdmin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [session, setSession] = useState(undefined);
  const [autorise, setAutorise] = useState(undefined);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [compteurs, setCompteurs] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => suivreSession(setSession), []);

  useEffect(() => {
    if (session === undefined) return;
    if (session === null) { navigate('/connexion'); return; }
    estAdmin().then(setAutorise).catch(() => setAutorise(false));
    estSuperAdmin().then(setSuperAdmin);
  }, [session, navigate]);

  const rafraichir = useCallback(() => tableauDeBord().then(setCompteurs).catch(() => {}), []);

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

  const aTraiter = compteurs
    ? compteurs.fournisseurs.en_attente + compteurs.produits.en_attente + compteurs.documents_en_attente + compteurs.messages.signales + (compteurs.affaires?.contestees || 0)
    : 0;

  return (
    <div className={`esp${menuOuvert ? ' esp-menu-ouvert' : ''}`}>
      <header className="esp-haut">
        <div className="esp-marque">
          <button type="button" className="esp-bouton-icone esp-burger" onClick={() => setMenuOuvert((o) => !o)} aria-label="Ouvrir le menu">
            {menuOuvert ? <X size={22} /> : <Menu size={22} />}
          </button>
          <img src="/logo.jpeg" alt="" width="34" height="34" />
          <span className="esp-marque-nom">LOOHOO</span>
          <span className="esp-marque-sep" />
          <span className="esp-marque-titre">Administration</span>
        </div>
        <div className="esp-haut-droite">
          <span className="esp-puce esp-puce-neutre" title="Votre rôle">{superAdmin ? 'Super-admin' : 'Modérateur'}</span>
          <span className="esp-avatar" title={session.user.email}>{initiales(session.user.email)}</span>
          <span className="esp-nom">{session.user.email}</span>
          <button type="button" className="esp-bouton-icone" aria-label="Se déconnecter" title="Se déconnecter" onClick={() => deconnecterAdmin().then(() => navigate('/connexion'))}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="esp-corps">
        <nav className="esp-menu" aria-label="Administration">
          {LIENS.filter((lien) => !lien.superSeulement || superAdmin).map(({ vers, texte, icone: Icone, pastille, fin }) => (
            <NavLink key={vers} to={vers} end={fin} className={({ isActive }) => `esp-lien${isActive ? ' esp-lien-actif' : ''}`}>
              <Icone size={19} /> {texte}
              {pastille && aTraiter > 0 && <span className="esp-pastille">{aTraiter > 99 ? '99+' : aTraiter}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="esp-voile" onClick={() => setMenuOuvert(false)} />
        <main className="esp-contenu">
          <Outlet context={{ compteurs, rafraichir, superAdmin }} />
        </main>
      </div>
    </div>
  );
}
