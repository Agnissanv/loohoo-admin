import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Download, Phone, Search, Trash2 } from 'lucide-react';
import { recupererAcheteurs, recupererConversations, recupererNotes, ajouterNote, supprimerNote } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { exporterCsv, formatDate, formatDateHeure, formatRelatif } from '../utils/format.js';

export default function Acheteurs() {
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState(null);
  const acheteurs = useAdminDonnees(recupererAcheteurs);
  const conversations = useAdminDonnees(recupererConversations);

  const parAcheteur = useMemo(() => {
    const m = {};
    (conversations.donnees || []).forEach((c) => { if (c.vendeur?.id) (m[c.vendeur.id] ||= []).push(c); });
    return m;
  }, [conversations.donnees]);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (acheteurs.donnees || []).filter((a) => !q || (a.nom || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.telephone || '').includes(q) || (a.activite || '').toLowerCase().includes(q));
  }, [acheteurs.donnees, recherche]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
        <h1 className="esp-titre-page" style={{ margin: 0 }}>Acheteurs{acheteurs.donnees ? ` (${acheteurs.donnees.length})` : ''}</h1>
        <button type="button" className="btn btn-outline" disabled={!visibles.length} onClick={() => exporterCsv('acheteurs', [
          { titre: 'Nom', valeur: (a) => a.nom }, { titre: 'Téléphone', valeur: (a) => a.telephone }, { titre: 'E-mail', valeur: (a) => a.email },
          { titre: 'Activité', valeur: (a) => a.activite }, { titre: 'Inscrit le', valeur: (a) => formatDate(a.date_inscription) },
          { titre: 'Conversations', valeur: (a) => (parAcheteur[a.id] || []).length },
        ], visibles)}><Download size={16} /> Exporter</button>
      </div>

      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input className="champ" style={{ paddingLeft: '2.3rem' }} type="search" placeholder="Nom, e-mail, téléphone ou activité" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>

      {acheteurs.erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{acheteurs.erreur}</p>}
      {acheteurs.donnees === undefined && <div className="loo-squelette" style={{ height: '200px' }} />}
      {acheteurs.donnees && visibles.length === 0 && <p style={{ opacity: 0.7 }}>Aucun acheteur.</p>}

      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {visibles.map((a) => {
          const convs = parAcheteur[a.id] || [];
          const estOuvert = ouvert === a.id;
          return (
            <div key={a.id} className="esp-carte" style={{ padding: '0.9rem 1.1rem' }}>
              <button type="button" onClick={() => setOuvert(estOuvert ? null : a.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                <span>
                  <strong>{a.nom}</strong>
                  <span className="esp-aide" style={{ display: 'block' }}>{a.activite || 'Activité non précisée'} · inscrit {formatRelatif(a.date_inscription)}</span>
                </span>
                <span style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', fontSize: '0.88rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> {a.telephone}</span>
                  <span>{a.email}</span>
                  <span className="esp-puce esp-puce-neutre">{convs.length} conversation{convs.length > 1 ? 's' : ''}</span>
                  {estOuvert ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {estOuvert && <Details acheteur={a} conversations={convs} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Details({ acheteur, conversations }) {
  const [notes, setNotes] = useState([]);
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState('');
  const charger = useCallback(() => recupererNotes('vendeur', acheteur.id).then(setNotes).catch(() => {}), [acheteur.id]);
  useEffect(() => { charger(); }, [charger]);

  async function ajouter(e) {
    e.preventDefault();
    setErreur('');
    try { await ajouterNote('vendeur', acheteur.id, texte); setTexte(''); charger(); } catch (err) { setErreur(err.message); }
  }

  return (
    <div className="esp-grille esp-deux" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--loo-papier-ombre)', alignItems: 'start' }}>
      <div>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Conversations</h3>
        {conversations.length === 0 && <p className="esp-aide">Aucune conversation.</p>}
        {conversations.map((c) => (
          <Link key={c.id} to={`/f/conversations/${c.id}`} className="esp-liste-ligne">
            <span style={{ fontSize: '0.9rem' }}>{c.grossiste?.nom}{c.produit?.nom ? ` · ${c.produit.nom}` : ''}</span>
            <span className="esp-aide">{formatRelatif(c.derniere_activite)}</span>
          </Link>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Notes internes</h3>
        <form onSubmit={ajouter} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <textarea className="champ" rows={2} placeholder="Ajouter une note" value={texte} onChange={(e) => setTexte(e.target.value)} />
          <button type="submit" className="btn btn-primary adm-bouton-petit" disabled={!texte.trim()}>Ajouter</button>
        </form>
        {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontSize: '0.85rem' }}>{erreur}</p>}
        {notes.map((n) => (
          <div key={n.id} className="esp-liste-ligne" style={{ alignItems: 'flex-start' }}>
            <div><div style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{n.texte}</div><div className="esp-aide">{formatDateHeure(n.date_note)}</div></div>
            <button type="button" className="esp-bouton-icone" aria-label="Supprimer la note" onClick={() => supprimerNote(n.id).then(charger)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
