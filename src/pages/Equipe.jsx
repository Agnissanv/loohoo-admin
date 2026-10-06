import React, { useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { Trash2, UserPlus } from 'lucide-react';
import { listeAdmins, ajouterAdmin, changerRoleAdmin, retirerAdmin } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { formatDate } from '../utils/format.js';

const ROLES = { super_admin: 'Super-administrateur', moderateur: 'Modérateur' };

// Équipe d'administration : réservée aux super-administrateurs
export default function Equipe() {
  const { superAdmin } = useOutletContext();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('moderateur');
  const [erreurAction, setErreurAction] = useState('');
  const [succes, setSucces] = useState('');
  const { donnees, erreur, recharger } = useAdminDonnees(listeAdmins);

  if (!superAdmin) return <Navigate to="/" replace />;

  async function agir(action, message) {
    setErreurAction('');
    setSucces('');
    try { await action(); await recharger(); if (message) setSucces(message); } catch (err) { setErreurAction(err.message || 'Action impossible.'); }
  }

  async function ajouter(e) {
    e.preventDefault();
    await agir(() => ajouterAdmin(email.trim(), role), `${email.trim()} a maintenant accès à l'administration.`);
    setEmail('');
  }

  return (
    <>
      <h1 className="esp-titre-page">Équipe d'administration</h1>
      <div className="esp-carte" style={{ marginBottom: '1rem' }}>
        <h2 className="esp-carte-titre"><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18} /> Donner accès à une personne</span></h2>
        <form onSubmit={ajouter} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="champ" type="email" required style={{ flex: '1 1 260px' }} placeholder="E-mail de la personne" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="champ" style={{ width: 'auto' }} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rôle">
            {Object.entries(ROLES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
          <button type="submit" className="btn btn-primary adm-bouton-petit">Donner l'accès</button>
        </form>
        <p className="esp-aide" style={{ margin: '0.6rem 0 0' }}>
          La personne doit d'abord avoir un compte sur le site (page de connexion de la plateforme).
          <strong> Modérateur :</strong> valide, rejette, suspend, vérifie les stocks, lit les conversations.
          <strong> Super-administrateur :</strong> en plus, commissions, équipe et catégories.
        </p>
      </div>

      {succes && <p role="status" style={{ color: '#1f7a3d', fontWeight: 600 }}>{succes}</p>}
      {(erreur || erreurAction) && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || erreurAction}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '140px' }} />}

      {donnees && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>Administrateur</th><th>Rôle</th><th>Depuis</th><th /></tr></thead>
            <tbody>
              {donnees.map((a) => (
                <tr key={a.user_id}>
                  <td><strong>{a.email}</strong></td>
                  <td>
                    <select className="champ" style={{ width: 'auto', padding: '0.4em 0.7em', fontSize: '0.85rem' }} value={a.role} aria-label={`Rôle de ${a.email}`}
                      onChange={(e) => agir(() => changerRoleAdmin(a.user_id, e.target.value), 'Rôle modifié.')}>
                      {Object.entries(ROLES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                    </select>
                  </td>
                  <td>{formatDate(a.date_ajout)}</td>
                  <td>
                    <button type="button" className="esp-bouton-icone" aria-label={`Retirer l'accès de ${a.email}`} title="Retirer l'accès"
                      onClick={() => { if (window.confirm(`Retirer l'accès de ${a.email} ?`)) agir(() => retirerAdmin(a.user_id), 'Accès retiré.'); }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="esp-aide" style={{ marginTop: '1rem' }}>Toutes les modifications de l'équipe sont inscrites dans le journal d'audit. Il reste toujours au moins un super-administrateur.</p>
    </>
  );
}
