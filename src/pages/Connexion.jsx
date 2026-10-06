import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { connecterAdmin, suivreSession } from '../api/admin.js';

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Déjà connecté : inutile de ressaisir ses identifiants
  useEffect(() => suivreSession((session) => { if (session) navigate('/', { replace: true }); }), [navigate]);

  async function soumettre(e) {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      await connecterAdmin(email.trim(), motDePasse);
      navigate('/');
    } catch {
      setErreur('E-mail ou mot de passe incorrect.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--gradient-marque)' }}>
      <div className="carte" style={{ width: 'min(100%, 400px)', padding: '2rem' }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF1E0', color: 'var(--loo-rouge)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}><ShieldCheck size={26} /></span>
        <span className="etiquette" style={{ display: 'block' }}>LOOHOO · Administration</span>
        <h1 style={{ fontSize: '1.7rem', margin: '0.3rem 0 1.2rem' }}>Connexion</h1>
        <form onSubmit={soumettre} style={{ display: 'grid', gap: '0.8rem' }}>
          <div style={{ display: 'grid', gap: '0.3rem' }}>
            <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.86rem' }}>E-mail</label>
            <input id="email" className="champ" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div style={{ display: 'grid', gap: '0.3rem' }}>
            <label htmlFor="mdp" style={{ fontWeight: 600, fontSize: '0.86rem' }}>Mot de passe</label>
            <input id="mdp" className="champ" type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} autoComplete="current-password" />
          </div>
          {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{erreur}</p>}
          <button type="submit" className="btn btn-primary" disabled={envoi} style={{ justifyContent: 'center' }}>{envoi ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', opacity: 0.65, lineHeight: 1.5 }}>Accès réservé à l'équipe LOOHOO. Chaque action est enregistrée dans le journal d'audit.</p>
      </div>
    </div>
  );
}
