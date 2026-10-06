import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Download, Search } from 'lucide-react';
import { recupererFournisseurs, contactDe } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { exporterCsv, formatDate, STATUTS_FOURNISSEUR } from '../utils/format.js';

const FILTRES = [['tous', 'Tous'], ['en_attente', 'En attente'], ['publie', 'Publiés'], ['suspendu', 'Suspendus']];

export default function Fournisseurs() {
  const [params, setParams] = useSearchParams();
  const filtre = FILTRES.some(([k]) => k === params.get('statut')) ? params.get('statut') : 'tous';
  const [recherche, setRecherche] = useState('');
  const { donnees, erreur } = useAdminDonnees(recupererFournisseurs);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (donnees || []).filter((f) => (filtre === 'tous' || f.statut === filtre)
      && (!q || f.nom.toLowerCase().includes(q) || (f.ville || '').toLowerCase().includes(q) || (f.categorie || '').toLowerCase().includes(q)));
  }, [donnees, filtre, recherche]);

  const compte = (s) => (donnees || []).filter((f) => s === 'tous' || f.statut === s).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Fournisseurs</h1>
        <button type="button" className="btn btn-outline" disabled={!donnees?.length} onClick={() => exporterCsv('fournisseurs', [
          { titre: 'Nom', valeur: (f) => f.nom }, { titre: 'Catégorie', valeur: (f) => f.categorie }, { titre: 'Ville', valeur: (f) => f.ville },
          { titre: 'Commune', valeur: (f) => f.commune }, { titre: 'Statut', valeur: (f) => STATUTS_FOURNISSEUR[f.statut]?.texte },
          { titre: 'Vérifié', valeur: (f) => (f.badge_verifie ? 'oui' : 'non') }, { titre: 'Téléphone', valeur: (f) => contactDe(f).telephone },
          { titre: 'Produits', valeur: (f) => f.produit.length }, { titre: 'Inscrit le', valeur: (f) => formatDate(f.date_ajout) },
        ], visibles)}>
          <Download size={16} /> Exporter
        </button>
      </div>

      <div className="adm-onglets">
        {FILTRES.map(([cle, texte]) => (
          <button key={cle} type="button" className={`adm-onglet${filtre === cle ? ' adm-onglet-actif' : ''}`} onClick={() => setParams(cle === 'tous' ? {} : { statut: cle })}>
            {texte}{donnees ? ` (${compte(cle)})` : ''}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input className="champ" style={{ paddingLeft: '2.3rem' }} type="search" placeholder="Nom, ville ou catégorie" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>

      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && visibles.length === 0 && <p style={{ opacity: 0.7 }}>Aucun fournisseur ne correspond.</p>}

      {visibles.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>Fournisseur</th><th>Catégorie</th><th>Ville</th><th>Statut</th><th>Produits</th><th>Inscrit</th><th /></tr></thead>
            <tbody>
              {visibles.map((f) => {
                const st = STATUTS_FOURNISSEUR[f.statut] || STATUTS_FOURNISSEUR.en_attente;
                const publies = f.produit.filter((p) => p.statut === 'publie').length;
                return (
                  <tr key={f.id}>
                    <td><strong>{f.nom}</strong> {f.badge_verifie && <BadgeCheck size={15} color="#1f7a3d" style={{ verticalAlign: '-3px' }} />}
                      {f.drapeau_coordonnees && <span className="esp-puce esp-puce-orange" style={{ marginLeft: '0.4rem' }}>Coordonnées</span>}</td>
                    <td>{f.categorie}</td>
                    <td>{f.ville}{f.commune ? `, ${f.commune}` : ''}</td>
                    <td><span className={`esp-puce ${st.classe}`}>{st.texte}</span></td>
                    <td>{publies}/{f.produit.length}</td>
                    <td>{formatDate(f.date_ajout)}</td>
                    <td><Link to={`/fournisseurs/${f.id}`} className="btn btn-outline adm-bouton-petit">Ouvrir</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
