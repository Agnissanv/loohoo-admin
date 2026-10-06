import React, { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Check, Eye, Package, X } from 'lucide-react';
import {
  recupererFournisseurs, recupererProduits, recupererDocumentsEnAttente, recupererMessagesSignales,
  modererProduit, deciderDocument, lienDocument, marquerMessageTraite, contactDe,
} from '../api/admin.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';
import MotifModal from '../components/MotifModal.jsx';
import { formatPrix, formatRelatif, MODELES_MOTIFS, TYPES_DOCUMENT } from '../utils/format.js';

const ONGLETS = [
  ['fournisseurs', 'Fournisseurs'],
  ['produits', 'Produits'],
  ['documents', 'Documents'],
  ['messages', 'Messages signalés'],
];

export default function ATraiter() {
  const { rafraichir } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const onglet = ONGLETS.some(([k]) => k === params.get('onglet')) ? params.get('onglet') : 'fournisseurs';

  const fournisseurs = useAdminDonnees(() => recupererFournisseurs().then((l) => l.filter((f) => f.statut === 'en_attente')));
  const produits = useAdminDonnees(() => recupererProduits().then((l) => l.filter((p) => p.statut === 'en_attente')));
  const documents = useAdminDonnees(recupererDocumentsEnAttente);
  const messages = useAdminDonnees(recupererMessagesSignales);

  const nombres = {
    fournisseurs: fournisseurs.donnees?.length, produits: produits.donnees?.length,
    documents: documents.donnees?.length, messages: messages.donnees?.length,
  };
  const actuel = { fournisseurs, produits, documents, messages }[onglet];
  const apres = () => { actuel.recharger(); rafraichir(); };

  return (
    <>
      <h1 className="esp-titre-page">À traiter</h1>
      <div className="adm-onglets">
        {ONGLETS.map(([cle, texte]) => (
          <button key={cle} type="button" className={`adm-onglet${onglet === cle ? ' adm-onglet-actif' : ''}`} onClick={() => setParams({ onglet: cle })}>
            {texte}{nombres[cle] != null ? ` (${nombres[cle]})` : ''}
          </button>
        ))}
      </div>

      {actuel.erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{actuel.erreur}</p>}
      {actuel.donnees === undefined && <div className="loo-squelette" style={{ height: '180px' }} />}
      {actuel.donnees && actuel.donnees.length === 0 && (
        <div className="esp-carte" style={{ textAlign: 'center', padding: '2rem' }}><Check size={30} color="#1f7a3d" /><p style={{ margin: '0.5rem 0 0' }}>Rien à traiter ici.</p></div>
      )}

      {onglet === 'fournisseurs' && fournisseurs.donnees?.map((f) => <LigneFournisseur key={f.id} f={f} />)}
      {onglet === 'produits' && produits.donnees?.map((p) => <LigneProduit key={p.id} p={p} onChange={apres} />)}
      {onglet === 'documents' && documents.donnees?.map((d) => <LigneDocument key={d.id} d={d} onChange={apres} />)}
      {onglet === 'messages' && messages.donnees?.map((m) => <LigneMessage key={m.id} m={m} onChange={apres} />)}
    </>
  );
}

function Coche({ ok, texte }) {
  return <span className={`esp-puce ${ok ? 'esp-puce-vert' : 'esp-puce-rouge'}`}>{ok ? '✓' : '✗'} {texte}</span>;
}

function LigneFournisseur({ f }) {
  const nbProduits = f.produit.length;
  return (
    <div className="esp-carte" style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>{f.nom}</strong>
          <div style={{ fontSize: '0.84rem', opacity: 0.7 }}>{f.categorie} · {f.ville}{f.commune ? `, ${f.commune}` : ''} · inscrit {formatRelatif(f.date_ajout)}</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Coche ok={f.grossiste_photo.length > 0} texte="Photo" />
            <Coche ok={!!contactDe(f).telephone} texte="Téléphone" />
            <Coche ok={!!f.stock_confirme} texte="Stock déclaré" />
            <Coche ok={nbProduits > 0} texte={`${nbProduits} produit${nbProduits > 1 ? 's' : ''}`} />
            {f.drapeau_coordonnees && <span className="esp-puce esp-puce-orange">Coordonnées détectées</span>}
          </div>
        </div>
        <Link to={`/f/fournisseurs/${f.id}`} className="btn btn-primary adm-bouton-petit">Examiner la fiche</Link>
      </div>
    </div>
  );
}

function LigneProduit({ p, onChange }) {
  const [modal, setModal] = useState(null);
  const [erreur, setErreur] = useState('');
  async function publier() {
    setErreur('');
    try { await modererProduit(p.id, 'publie'); onChange(); } catch (err) { setErreur(err.message); }
  }
  return (
    <div className="esp-carte" style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {p.photo_url
          ? <img src={p.photo_url} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 10 }} />
          : <div style={{ width: 84, height: 84, borderRadius: 10, background: 'var(--loo-papier-ombre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={26} opacity={0.4} /></div>}
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <strong>{p.nom}</strong>
          <div style={{ fontSize: '0.84rem', opacity: 0.7 }}>
            <Link to={`/f/fournisseurs/${p.grossiste?.id}`} style={{ textDecoration: 'underline' }}>{p.grossiste?.nom}</Link> · {formatPrix(p.prix_gros_fcfa)} · minimum {p.moq}{p.stock_disponible != null ? ` · stock ${p.stock_disponible}` : ''}
          </div>
          {p.description && <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', lineHeight: 1.5, opacity: 0.85 }}>{p.description.slice(0, 260)}{p.description.length > 260 ? '…' : ''}</p>}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {!p.photo_url && <span className="esp-puce esp-puce-rouge">Sans photo</span>}
            {p.drapeau_coordonnees && <span className="esp-puce esp-puce-orange">Coordonnées détectées</span>}
            {(p.tags || []).slice(0, 4).map((t) => <span key={t} className="esp-puce esp-puce-neutre">{t}</span>)}
          </div>
        </div>
        <div className="adm-actions" style={{ alignSelf: 'center' }}>
          <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={publier}><Check size={14} /> Publier</button>
          <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setModal('rejet')}><X size={14} /> Rejeter</button>
        </div>
      </div>
      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.86rem', margin: '0.6rem 0 0' }}>{erreur}</p>}
      {modal === 'rejet' && (
        <MotifModal
          titre={`Rejeter « ${p.nom} »`} description="Le fournisseur verra ce motif et pourra corriger puis resoumettre le produit."
          modeles={MODELES_MOTIFS.produit} libelleBouton="Rejeter le produit" danger
          onConfirmer={(motif) => modererProduit(p.id, 'rejete', motif).then(onChange)} onFermer={() => setModal(null)}
        />
      )}
    </div>
  );
}

function LigneDocument({ d, onChange }) {
  const [modal, setModal] = useState(false);
  const [erreur, setErreur] = useState('');
  async function voir() {
    setErreur('');
    try { window.open(await lienDocument(d.chemin), '_blank', 'noopener'); } catch (err) { setErreur(err.message); }
  }
  async function verifier() {
    setErreur('');
    try { await deciderDocument(d.id, 'verifie'); onChange(); } catch (err) { setErreur(err.message); }
  }
  return (
    <div className="esp-carte" style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>{TYPES_DOCUMENT[d.type] || d.type}</strong>
          <div style={{ fontSize: '0.84rem', opacity: 0.7 }}>
            <Link to={`/f/fournisseurs/${d.grossiste?.id}`} style={{ textDecoration: 'underline' }}>{d.grossiste?.nom}</Link> · {d.nom_fichier}
          </div>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-outline adm-bouton-petit" onClick={voir}><Eye size={14} /> Consulter</button>
          <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={verifier}><Check size={14} /> Vérifié</button>
          <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setModal(true)}><X size={14} /> Rejeter</button>
        </div>
      </div>
      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.86rem', margin: '0.6rem 0 0' }}>{erreur}</p>}
      {modal && (
        <MotifModal
          titre="Rejeter ce document" modeles={MODELES_MOTIFS.document} libelleBouton="Rejeter" danger
          onConfirmer={(motif) => deciderDocument(d.id, 'rejete', motif).then(onChange)} onFermer={() => setModal(false)}
        />
      )}
    </div>
  );
}

function LigneMessage({ m, onChange }) {
  const [erreur, setErreur] = useState('');
  async function traiter() {
    setErreur('');
    try { await marquerMessageTraite(m.id, true); onChange(); } catch (err) { setErreur(err.message); }
  }
  const conv = m.conversation;
  return (
    <div className="esp-carte" style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.7 }}>
            {m.expediteur === 'vendeur' ? conv?.vendeur?.nom : conv?.grossiste?.nom} ({m.expediteur === 'vendeur' ? 'acheteur' : 'fournisseur'}) · {formatRelatif(m.date_envoi)}
          </div>
          <p style={{ margin: '0.4rem 0', fontSize: '0.92rem' }}><span style={{ opacity: 0.6 }}>Message envoyé : </span>{m.contenu}</p>
          {m.original && (
            <div className="adm-prive">
              <div style={{ fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.2rem' }}>Texte d'origine avant masquage ({(m.original.motifs || []).join(', ')})</div>
              <div style={{ fontSize: '0.9rem' }}>{m.original.contenu_original}</div>
            </div>
          )}
        </div>
        <div className="adm-actions" style={{ alignSelf: 'center' }}>
          {conv?.id && <Link to={`/f/conversations/${conv.id}`} className="btn btn-outline adm-bouton-petit">Voir la conversation</Link>}
          <button type="button" className="btn btn-primary adm-bouton-petit" onClick={traiter}><Check size={14} /> Marquer traité</button>
        </div>
      </div>
      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, fontSize: '0.86rem', margin: '0.6rem 0 0' }}>{erreur}</p>}
    </div>
  );
}
