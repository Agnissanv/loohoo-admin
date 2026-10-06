import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MessageSquare, Search } from 'lucide-react';
import { recupererConversations, recupererOriginauxMessages, marquerMessageTraite } from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import { formatHeure, formatJour, formatRelatif, initiales } from '../utils/format.js';

const trier = (messages = []) => [...messages].sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));

// Supervision en lecture seule : l'équipe voit tous les échanges (les conditions d'utilisation l'indiquent).
export default function Conversations() {
  const { id } = useParams();
  const { rafraichir } = useOutletContext();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('toutes');
  const { donnees, erreur, recharger } = useAdminDonnees(recupererConversations);

  const liste = useMemo(() => (donnees || []).map((c) => {
    const messages = trier(c.message);
    const dernier = messages[messages.length - 1];
    return {
      ...c, messages, dernier,
      signales: messages.filter((m) => m.signale && !m.signale_traite).length,
      sansReponse: !messages.some((m) => m.expediteur === 'fournisseur'),
    };
  }), [donnees]);

  const q = recherche.trim().toLowerCase();
  const visibles = liste.filter((c) => (filtre === 'toutes' || (filtre === 'signalees' && c.signales > 0) || (filtre === 'sans_reponse' && c.sansReponse))
    && (!q || (c.vendeur?.nom || '').toLowerCase().includes(q) || (c.grossiste?.nom || '').toLowerCase().includes(q) || (c.produit?.nom || '').toLowerCase().includes(q)));
  const courante = liste.find((c) => c.id === id) || null;

  if (erreur && !donnees) return <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>;
  if (donnees === undefined) return <div className="loo-squelette" style={{ height: '300px' }} />;

  return (
    <>
      <h1 className="esp-titre-page" style={{ marginBottom: '0.8rem' }}>Conversations</h1>
      <div className={`msg${id ? ' msg-ouverte' : ''}`}>
        <aside className="msg-liste">
          <div className="msg-liste-haut">
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input className="champ" style={{ padding: '0.6em 0.8em 0.6em 2.2rem', fontSize: '0.9rem' }} type="search" placeholder="Acheteur, fournisseur ou produit" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
            <div className="adm-onglets" style={{ margin: '0.6rem 0 0' }}>
              {[['toutes', 'Toutes'], ['signalees', 'Signalées'], ['sans_reponse', 'Sans réponse']].map(([k, t]) => (
                <button key={k} type="button" className={`adm-onglet${filtre === k ? ' adm-onglet-actif' : ''}`} style={{ fontSize: '0.74rem' }} onClick={() => setFiltre(k)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="msg-liste-corps">
            {visibles.length === 0 && <p style={{ padding: '1.2rem', opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Aucune conversation.</p>}
            {visibles.map((c) => (
              <Link key={c.id} to={`/conversations/${c.id}`} className={`msg-ligne${c.id === id ? ' msg-ligne-active' : ''}`}>
                <span className="esp-avatar" style={{ width: 42, height: 42, flexShrink: 0 }}>{initiales(c.vendeur?.nom)}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong className="msg-nom">{c.vendeur?.nom || 'Acheteur'} → {c.grossiste?.nom}</strong>
                    <span className="msg-heure">{formatRelatif(c.derniere_activite)}</span>
                  </div>
                  {c.produit?.nom && <div className="msg-produit">{c.produit.nom}</div>}
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    {c.signales > 0 && <span className="esp-puce esp-puce-orange" style={{ fontSize: '0.66rem' }}>{c.signales} signalé{c.signales > 1 ? 's' : ''}</span>}
                    {c.sansReponse && <span className="esp-puce esp-puce-rouge" style={{ fontSize: '0.66rem' }}>Sans réponse</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="msg-fil">
          {courante ? <Fil key={courante.id} c={courante} onChange={() => { recharger(); rafraichir(); }} />
            : <div className="msg-vide"><MessageSquare size={34} color="var(--loo-rouge)" /><p>Sélectionnez une conversation pour la lire.</p></div>}
        </section>
      </div>
    </>
  );
}

function Fil({ c, onChange }) {
  const [originaux, setOriginaux] = useState({});
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const ids = c.messages.filter((m) => m.signale).map((m) => m.id);
    if (ids.length) recupererOriginauxMessages(ids).then(setOriginaux).catch(() => {});
  }, [c.id, c.messages]);

  async function traiter(m) {
    setErreur('');
    try { await marquerMessageTraite(m.id, true); onChange(); } catch (err) { setErreur(err.message); }
  }

  return (
    <>
      <header className="msg-fil-haut">
        <Link to="/conversations" className="msg-retour" aria-label="Retour"><ArrowLeft size={20} /></Link>
        <span className="esp-avatar" style={{ width: 42, height: 42 }}>{initiales(c.vendeur?.nom)}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong>{c.vendeur?.nom || 'Acheteur'} → <Link to={`/fournisseurs/${c.grossiste?.id}`} style={{ textDecoration: 'underline' }}>{c.grossiste?.nom}</Link></strong>
          <div style={{ fontSize: '0.8rem', opacity: 0.65 }}>{c.vendeur?.activite || 'Acheteur'}{c.produit?.nom ? ` · à propos de ${c.produit.nom}` : ''}</div>
        </div>
        <span className="esp-puce esp-puce-neutre">Lecture seule</span>
      </header>
      <div className="msg-fil-corps">
        {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur}</p>}
        {c.messages.map((m, i) => {
          const precedent = c.messages[i - 1];
          const nouveauJour = !precedent || formatJour(precedent.date_envoi) !== formatJour(m.date_envoi);
          const acheteur = m.expediteur === 'vendeur';
          const o = originaux[String(m.id)];
          return (
            <React.Fragment key={m.id}>
              {nouveauJour && <div className="msg-jour">{formatJour(m.date_envoi)}</div>}
              <div className={`msg-bulle ${acheteur ? 'msg-lui' : 'msg-moi'} msg-debut`}>
                <div style={{ fontSize: '0.68rem', opacity: 0.7, marginBottom: '0.15rem' }}>{acheteur ? 'Acheteur' : 'Fournisseur'}</div>
                <p className="msg-texte">{m.contenu}</p>
                {m.signale && (
                  <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', borderRadius: 8, background: '#FFF6E9', color: 'var(--loo-encre)', fontSize: '0.82rem' }}>
                    <strong>Signalé</strong>{o ? ` (${(o.motifs || []).join(', ')})` : ''}
                    {o && <div>Texte d'origine : {o.contenu_original}</div>}
                    {!m.signale_traite && <button type="button" className="btn btn-primary adm-bouton-petit" style={{ marginTop: '0.4rem' }} onClick={() => traiter(m)}><Check size={13} /> Marquer traité</button>}
                    {m.signale_traite && <div style={{ opacity: 0.7 }}>Traité</div>}
                  </div>
                )}
                <span className="msg-meta">{formatHeure(m.date_envoi)}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
