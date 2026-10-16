import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { connecterAdmin } from '../api/admin.js';

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [visible, setVisible] = useState(false);
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
          <div style={{ position: 'relative' }}>
            <input
              className="champ"
              style={{ width: '100%', paddingRight: '2.4rem' }}
              type={visible ? 'text' : 'password'}
              required
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 0, padding: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--loo-gris, #6b7280)',
              }}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erreur && <p style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{erreur}</p>}
          <button type="submit" className="btn btn-primary" disabled={envoi} style={{ justifyContent: 'center' }}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="loo-admin-note" style={{ marginTop: '1.2rem' }}>
          Espace réservé aux comptes administrateurs LOOHOO. Il n'y a pas de création de compte ici :
          l'accès s'ouvre depuis le tableau de bord du siège.
        </p>
      </div>
    </section>
  );
}