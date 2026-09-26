import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { deconnecterAdmin } from '../api/admin.js';

export default function NavAdmin() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lien = (chemin) => ({
    fontWeight: 600, fontSize: '0.9rem', padding: '0.4em 0.9em', borderRadius: 'var(--rayon-sm)',
    background: pathname === chemin ? 'var(--loo-encre)' : 'transparent',
    color: pathname === chemin ? 'var(--loo-papier)' : 'var(--loo-encre)',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', flexWrap: 'wrap', gap: '1rem' }}>
      <nav style={{ display: 'flex', gap: '0.6rem' }}>
        <Link to="/" style={lien('/')}>Fournisseurs</Link>
        <Link to="/boutiques" style={lien('/boutiques')}>Boutiques</Link>
      </nav>
      <button type="button" className="btn btn-outline" onClick={() => deconnecterAdmin().then(() => navigate('/connexion'))}>
        <LogOut size={16} /> Se déconnecter
      </button>
    </div>
  );
}