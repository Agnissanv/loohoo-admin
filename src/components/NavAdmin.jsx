import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { deconnecterAdmin } from '../api/admin.js';

export default function NavAdmin() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lien = (chemin) => `loo-admin-nav-lien${pathname === chemin ? ' actif' : ''}`;

  return (
    <div className="loo-admin-nav">
      <nav className="loo-admin-nav-liens">
        <Link to="/" className={lien('/')}>Fournisseurs</Link>
        <Link to="/boutiques" className={lien('/boutiques')}>Boutiques</Link>
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
