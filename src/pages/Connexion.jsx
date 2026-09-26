import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connecterAdmin } from '../api/admin.js';

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      await connecterAdmin(email, motDePasse);
      navigate('/');
    } catch {
      setErreur('E-mail ou mot de passe incorrect.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <section className="section" style={{ maxWidth: '380px', margin: '4rem auto 0' }}>
      <div className="container">
        <span className="etiquette">LOOHOO — Administration</span>
        <h1 className="section-titre">Connexion</h1>
        <form onSubmit={soumettre} style={{ display: 'grid', gap: '0.9rem', marginTop: '1.2rem' }}>
          <input className="champ" type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className="champ" type="password" required placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} autoComplete="current-password" />
          {erreur && <p style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{erreur}</p>}
          <button type="submit" className="btn btn-primary" disabled={envoi} style={{ justifyContent: 'center' }}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </section>
  );
}