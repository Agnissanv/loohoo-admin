import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { deconnecterAdmin } from '../api/admin.js';

/*
  Barre de navigation de l'administration.

  Les entrées correspondent aux écrans des maquettes du client (admin n01 à n04) :
  - « Général »            → tableau de bord super-admin (maquette n01)
  - « Fournisseurs »       → sous-module admin de gestion des fournisseurs (n02)
  - « Modérateur »         → espace du modérateur, persona Anno (n03)
  - « Service client »     → litiges + call center, persona Marie C. (n04)
  - « Boutiques »          → onglet réservé au super-admin (verrouillé sur la maquette)

  À FAIRE (spec v3, point 17 « rôles ») : filtrer ces entrées selon le rôle de la
  personne connectée. Aujourd'hui la barre montre tout, pour permettre de relire
  les 4 écrans. Le verrou Boutiques est purement visuel tant que le contrôle
  d'accès n'est pas branché côté serveur.
*/
const ENTREES = [
  { chemin: '/', libelle: 'Général' },
  { chemin: '/fournisseurs', libelle: 'Fournisseurs' },
  { chemin: '/moderateur', libelle: 'Modérateur' },
  { chemin: '/service-client', libelle: 'Service client' },
  { chemin: '/boutiques', libelle: 'Boutiques 🔒' },
];

export default function NavAdmin() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lien = (chemin) => `loo-admin-nav-lien${pathname === chemin ? ' actif' : ''}`;

  return (
    <div className="loo-admin-nav">
      <nav className="loo-admin-nav-liens">
        {ENTREES.map((e) => (
          <Link key={e.chemin} to={e.chemin} className={lien(e.chemin)}>
            {e.libelle}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="btn btn-outline loo-admin-btn"
        onClick={() => deconnecterAdmin().then(() => navigate('/connexion'))}
      >
        <LogOut size={16} /> Se déconnecter
      </button>
    </div>
  );
}
