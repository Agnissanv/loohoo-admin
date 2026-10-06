import React, { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { recupererProduits, modererProduit, verifierStock } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import MotifModal from '../components/MotifModal.jsx';
import { exporterCsv, formatDate, formatPrix, MODELES_MOTIFS, STATUTS_PRODUIT } from '../utils/format.js';

const FILTRES = [
  ['tous', 'Tous'], ['en_attente', 'En attente'], ['publie', 'Publiés'], ['rejete', 'Rejetés'],
  ['drapeaux', 'Coordonnées détectées'], ['stock', 'Stock non vérifié'],
];

export default function Produits() {
  const { rafraichir } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const filtre = FILTRES.some(([k]) => k === params.get('filtre')) ? params.get('filtre') : 'tous';
  const [recherche, setRecherche] = useState('');
  const [rejet, setRejet] = useState(null);
  const [erreurAction, setErreurAction] = useState('');
  const { donnees, erreur, recharger } = useAdminDonnees(recupererProduits);

  const correspond = (p, f) => {
    if (f === 'tous') return true;
    if (f === 'drapeaux') return p.drapeau_coordonnees;
    if (f === 'stock') return p.statut === 'publie' && p.actif && !p.stock_verifie_le;
    return p.statut === f;
  };
  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (donnees || []).filter((p) => correspond(p, filtre)
      && (!q || p.nom.toLowerCase().includes(q) || (p.grossiste?.nom || '').toLowerCase().includes(q) || (p.categorie || '').toLowerCase().includes(q)));
  }, [donnees, filtre, recherche]);

  async function agir(action) {
    setErreurAction('');
    try { await action(); await recharger(); rafraichir(); } catch (err) { setErreurAction(err.message || 'Action impossible.'); }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Produits</h1>
        <button type="button" className="btn btn-outline" disabled={!visibles.length} onClick={() => exporterCsv('produits', [
          { titre: 'Produit', valeur: (p) => p.nom }, { titre: 'Fournisseur', valeur: (p) => p.grossiste?.nom }, { titre: 'Catégorie', valeur: (p) => p.categorie },
          { titre: 'Prix de gros', valeur: (p) => p.prix_gros_fcfa }, { titre: 'MOQ', valeur: (p) => p.moq }, { titre: 'Stock', valeur: (p) => p.stock_disponible },
          { titre: 'Statut', valeur: (p) => STATUTS_PRODUIT[p.statut]?.texte }, { titre: 'Stock vérifié', valeur: (p) => (p.stock_verifie_le ? 'oui' : 'non') },
        ], visibles)}><Download size={16} /> Exporter</button>
      </div>

      <div className="adm-onglets">
        {FILTRES.map(([cle, texte]) => (
          <button key={cle} type="button" className={`adm-onglet${filtre === cle ? ' adm-onglet-actif' : ''}`} onClick={() => setParams(cle === 'tous' ? {} : { filtre: cle })}>
            {texte}{donnees ? ` (${donnees.filter((p) => correspond(p, cle)).length})` : ''}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input className="champ" style={{ paddingLeft: '2.3rem' }} type="search" placeholder="Produit, fournisseur ou catégorie" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>

      {(erreur || erreurAction) && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || erreurAction}</p>}
      {donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {donnees && visibles.length === 0 && <p style={{ opacity: 0.7 }}>Aucun produit ne correspond.</p>}

      {visibles.length > 0 && (
        <div className="esp-carte adm-defile" style={{ padding: 0 }}>
          <table className="adm-table">
            <thead><tr><th>Produit</th><th>Fournisseur</th><th>Prix de gros</th><th>Stock</th><th>Statut</th><th>Ajouté</th><th>Actions</th></tr></thead>
            <tbody>
              {visibles.map((p) => {
                const st = STATUTS_PRODUIT[p.statut] || STATUTS_PRODUIT.en_attente;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--loo-papier-ombre)' }} />}
                        <div><strong>{p.nom}</strong>{p.drapeau_coordonnees && <span className="esp-puce esp-puce-orange" style={{ marginLeft: '0.4rem' }}>Coordonnées</span>}
                          <div className="esp-aide">{p.categorie}</div></div>
                      </div>
                    </td>
                    <td><Link to={`/fournisseurs/${p.grossiste?.id}`} style={{ textDecoration: 'underline' }}>{p.grossiste?.nom}</Link></td>
                    <td>{formatPrix(p.prix_gros_fcfa)}<div className="esp-aide">min. {p.moq}</div></td>
                    <td>{p.stock_disponible ?? '–'}{' '}
                      {p.stock_disponible != null && (p.stock_verifie_le ? <span className="esp-puce esp-puce-vert">vérifié</span> : <span className="esp-puce esp-puce-neutre">non vérifié</span>)}</td>
                    <td><span className={`esp-puce ${st.classe}`}>{st.texte}</span>{!p.actif && <span className="esp-puce esp-puce-neutre" style={{ marginLeft: '0.3rem' }}>désactivé</span>}</td>
                    <td>{formatDate(p.date_ajout)}</td>
                    <td>
                      <div className="adm-actions">
                        {p.statut !== 'publie' && <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => agir(() => modererProduit(p.id, 'publie'))}>Publier</button>}
                        {p.statut !== 'rejete' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setRejet(p)}>Rejeter</button>}
                        {p.stock_disponible != null && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => agir(() => verifierStock(p.id, !p.stock_verifie_le))}>{p.stock_verifie_le ? 'Retirer vérif.' : 'Vérifier stock'}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejet && (
        <MotifModal
          titre={`Rejeter « ${rejet.nom} »`} description="Le fournisseur verra ce motif et pourra corriger puis resoumettre le produit." modeles={MODELES_MOTIFS.produit}
          libelleBouton="Rejeter le produit" danger onConfirmer={(motif) => modererProduit(rejet.id, 'rejete', motif).then(async () => { await recharger(); rafraichir(); })} onFermer={() => setRejet(null)}
        />
      )}
    </>
  );
}
