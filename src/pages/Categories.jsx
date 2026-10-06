import React, { useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import {
  recupererCategories, creerCategorie, majCategorie, renommerCategorie, creerSousCategorie, majSousCategorie, renommerSousCategorie,
} from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';

// Catégories et sous-catégories proposées aux fournisseurs : réservé aux super-administrateurs.
// Désactiver masque une catégorie des formulaires sans toucher aux produits existants. Renommer met aussi à jour les produits et fournisseurs concernés.
export default function Categories() {
  const { superAdmin } = useOutletContext();
  const [erreurAction, setErreurAction] = useState('');
  const [nouvelle, setNouvelle] = useState('');
  const { donnees, erreur, recharger } = useAdminDonnees(recupererCategories);

  if (!superAdmin) return <Navigate to="/" replace />;

  async function agir(action) {
    setErreurAction('');
    try { await action(); await recharger(); } catch (err) { setErreurAction(err.message || 'Action impossible.'); }
  }

  // Échange la position de deux éléments voisins
  async function deplacer(liste, i, sens, maj) {
    const voisin = liste[i + sens];
    if (!voisin) return;
    await agir(async () => {
      await maj(liste[i].id, { ordre: voisin.ordre === liste[i].ordre ? voisin.ordre + sens : voisin.ordre });
      await maj(voisin.id, { ordre: liste[i].ordre });
    });
  }

  function renommer(libelle, ancien, action) {
    const nouveau = window.prompt(`${libelle}\nNouveau nom :`, ancien);
    if (nouveau && nouveau.trim() && nouveau.trim() !== ancien) agir(() => action(nouveau.trim()));
  }

  return (
    <>
      <h1 className="esp-titre-page">Catégories</h1>
      <p className="esp-aide" style={{ marginBottom: '1rem', maxWidth: '75ch' }}>
        Ces listes alimentent les formulaires des fournisseurs (inscription, profil, produits). Désactiver masque l'élément des formulaires sans toucher aux produits existants.
        Renommer met à jour tous les fournisseurs et produits qui l'utilisent.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); const nom = nouvelle; setNouvelle(''); agir(() => creerCategorie(nom, (donnees?.length || 0) + 1)); }} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input className="champ" style={{ maxWidth: '340px' }} placeholder="Nouvelle catégorie" value={nouvelle} onChange={(e) => setNouvelle(e.target.value)} />
        <button type="submit" className="btn btn-primary adm-bouton-petit" disabled={!nouvelle.trim()}><Plus size={14} /> Ajouter</button>
      </form>

      {(erreur || erreurAction) && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || erreurAction}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}

      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {(donnees || []).map((c, i) => (
          <div key={c.id} className="esp-carte" style={{ opacity: c.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1.02rem' }}>{c.nom}{!c.active && <span className="esp-puce esp-puce-neutre" style={{ marginLeft: '0.5rem' }}>Désactivée</span>}</strong>
              <div className="adm-actions">
                <button type="button" className="esp-bouton-icone" aria-label="Monter" disabled={i === 0} onClick={() => deplacer(donnees, i, -1, majCategorie)}><ArrowUp size={16} /></button>
                <button type="button" className="esp-bouton-icone" aria-label="Descendre" disabled={i === donnees.length - 1} onClick={() => deplacer(donnees, i, 1, majCategorie)}><ArrowDown size={16} /></button>
                <button type="button" className="esp-bouton-icone" aria-label="Renommer" onClick={() => renommer('Renommer la catégorie', c.nom, (n) => renommerCategorie(c.nom, n))}><Pencil size={16} /></button>
                <button type="button" className="esp-bouton-icone" aria-label={c.active ? 'Désactiver' : 'Activer'} title={c.active ? 'Désactiver' : 'Activer'} onClick={() => agir(() => majCategorie(c.id, { active: !c.active }))}>{c.active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.7rem' }}>
              {c.sous_categorie.map((s, k) => (
                <span key={s.id} className={`esp-puce ${s.active ? 'esp-puce-neutre' : 'esp-puce-rouge'}`} style={{ gap: '0.3rem', padding: '0.3em 0.5em 0.3em 0.8em' }}>
                  {s.nom}
                  <button type="button" className="esp-bouton-icone" style={{ padding: '0.1rem' }} aria-label={`Renommer ${s.nom}`} onClick={() => renommer(`Renommer la sous-catégorie « ${s.nom} »`, s.nom, (n) => renommerSousCategorie(c.nom, s.nom, n))}><Pencil size={12} /></button>
                  <button type="button" className="esp-bouton-icone" style={{ padding: '0.1rem' }} aria-label={s.active ? `Désactiver ${s.nom}` : `Activer ${s.nom}`} onClick={() => agir(() => majSousCategorie(s.id, { active: !s.active }))}>{s.active ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                  {k > 0 && <button type="button" className="esp-bouton-icone" style={{ padding: '0.1rem' }} aria-label={`Monter ${s.nom}`} onClick={() => deplacer(c.sous_categorie, k, -1, majSousCategorie)}><ArrowUp size={12} /></button>}
                </span>
              ))}
              <AjoutSous onAjouter={(nom) => agir(() => creerSousCategorie(c.id, nom, c.sous_categorie.length + 1))} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AjoutSous({ onAjouter }) {
  const [texte, setTexte] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (texte.trim()) { onAjouter(texte); setTexte(''); } }} style={{ display: 'inline-flex', gap: '0.3rem' }}>
      <input className="champ" style={{ padding: '0.3em 0.7em', fontSize: '0.82rem', width: '170px' }} placeholder="+ Sous-catégorie" value={texte} onChange={(e) => setTexte(e.target.value)} aria-label="Nouvelle sous-catégorie" />
    </form>
  );
}
