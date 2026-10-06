import React, { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Check, Eye, MapPin, Phone, Trash2, X } from 'lucide-react';
import {
  recupererFournisseurComplet, deciderFournisseur, modererProduit, verifierStock, deciderDocument, lienDocument,
  recupererNotes, ajouterNote, supprimerNote, recupererJournalCible, recupererConversations, contactDe,
} from '../api/admin.js';
import MotifModal from '../components/MotifModal.jsx';
import {
  formatDate, formatDateHeure, formatPrix, formatRelatif, MODELES_MOTIFS, STATUTS_FOURNISSEUR, STATUTS_PRODUIT, TYPES_DOCUMENT,
} from '../utils/format.js';

const STATUTS_DOC = {
  en_attente: { texte: 'En attente', classe: 'esp-puce-orange' },
  verifie: { texte: 'Vérifié', classe: 'esp-puce-vert' },
  rejete: { texte: 'Rejeté', classe: 'esp-puce-rouge' },
};
const ACTIONS_JOURNAL = {
  fournisseur_statut: 'Statut du fournisseur', fournisseur_badge: 'Badge « Vérifié »', produit_statut: 'Statut d\'un produit',
  produit_stock: 'Vérification du stock', document_statut: 'Document',
};

export default function FicheFournisseur() {
  const { id } = useParams();
  const { rafraichir } = useOutletContext();
  const [f, setF] = useState(undefined);
  const [notes, setNotes] = useState([]);
  const [journal, setJournal] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [erreur, setErreur] = useState('');
  const [modal, setModal] = useState(null); // { type: 'suspendre' | 'produit', produit? }
  const [nouvelleNote, setNouvelleNote] = useState('');

  const charger = useCallback(async () => {
    try {
      const fiche = await recupererFournisseurComplet(id);
      setF(fiche);
      recupererNotes('grossiste', id).then(setNotes).catch(() => {});
      recupererJournalCible('grossiste', id).then(setJournal).catch(() => {});
      recupererConversations().then((l) => setConversations(l.filter((c) => c.grossiste?.id === id))).catch(() => {});
    } catch (err) {
      setErreur(err.message || 'Chargement impossible.');
      setF(null);
    }
  }, [id]);

  useEffect(() => { charger(); }, [charger]);

  if (f === undefined) return <div className="loo-squelette" style={{ height: '300px' }} />;
  if (!f) return <><p style={{ color: 'var(--loo-rouge)', fontWeight: 600 }}>{erreur || 'Fournisseur introuvable.'}</p><Link to="/fournisseurs" className="btn btn-outline">Retour</Link></>;

  const contact = contactDe(f);
  const reseaux = contact.reseaux_sociaux || f.reseaux_sociaux || {};
  const st = STATUTS_FOURNISSEUR[f.statut] || STATUTS_FOURNISSEUR.en_attente;
  const produits = [...(f.produit || [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const photos = f.grossiste_photo || [];
  const documents = f.document_fournisseur || [];

  const prerequis = [
    ['Au moins une photo de l\'entreprise', photos.length > 0],
    ['Téléphone renseigné', !!contact.telephone],
    ['Stock déclaré disponible', !!f.stock_confirme],
    ['Au moins un produit', produits.length > 0],
    ['Aucune coordonnée dans le profil', !f.drapeau_coordonnees],
  ];
  const pret = prerequis.every(([, ok]) => ok);

  async function agir(action) {
    setErreur('');
    try { await action(); await charger(); rafraichir(); } catch (err) { setErreur(err.message || 'Action impossible.'); }
  }

  async function voirDocument(d) {
    setErreur('');
    try { window.open(await lienDocument(d.chemin), '_blank', 'noopener'); } catch (err) { setErreur(err.message || 'Document inaccessible.'); }
  }

  async function envoyerNote(e) {
    e.preventDefault();
    if (!nouvelleNote.trim()) return;
    await agir(async () => { await ajouterNote('grossiste', id, nouvelleNote); setNouvelleNote(''); });
  }

  return (
    <>
      <Link to="/fournisseurs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--loo-rouge)', marginBottom: '0.8rem' }}><ArrowLeft size={15} /> Fournisseurs</Link>

      {/* En-tête et décisions */}
      <div className="esp-carte" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {f.logo_url ? <img src={f.logo_url} alt="" style={{ width: 84, height: 84, borderRadius: 14, objectFit: 'cover' }} /> : <span className="esp-avatar" style={{ width: 84, height: 84, fontSize: '1.6rem' }}>{f.nom.slice(0, 2).toUpperCase()}</span>}
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <span className={`esp-puce ${st.classe}`}>{st.texte}</span>
            {f.badge_verifie && <span className="badge badge-verifie"><BadgeCheck size={13} /> Vérifié</span>}
            {f.est_fabricant && <span className="badge badge-fabricant">Fabricant local</span>}
            {f.drapeau_coordonnees && <span className="esp-puce esp-puce-orange">Coordonnées détectées</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>{f.nom}</h1>
          <div style={{ fontSize: '0.88rem', opacity: 0.75, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {f.commune ? `${f.commune}, ` : ''}{f.ville}</span>
            <span>{f.categorie}</span><span>Inscrit le {formatDate(f.date_ajout)}</span>
          </div>
          {contact.motif_statut && f.statut !== 'publie' && <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--loo-rouge)' }}>Motif en cours : {contact.motif_statut}</p>}
        </div>
        <div className="adm-actions" style={{ flexDirection: 'column', alignItems: 'stretch', minWidth: '210px' }}>
          {f.statut !== 'publie' && (
            <button type="button" className="btn adm-bouton-succes" style={{ justifyContent: 'center' }} onClick={() => agir(() => deciderFournisseur(f.id, 'publie'))}>
              <Check size={16} /> Publier ce fournisseur
            </button>
          )}
          {f.statut !== 'suspendu' && (
            <button type="button" className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => setModal({ type: 'suspendre' })}><X size={16} /> Suspendre</button>
          )}
          {f.statut === 'suspendu' && (
            <button type="button" className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => agir(() => deciderFournisseur(f.id, 'en_attente'))}>Remettre en attente</button>
          )}
          <button type="button" className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => agir(() => deciderFournisseur(f.id, f.statut, null, !f.badge_verifie))}>
            <BadgeCheck size={16} /> {f.badge_verifie ? 'Retirer le badge' : 'Accorder le badge « Vérifié »'}
          </button>
        </div>
      </div>

      {erreur && <p role="alert" style={{ color: 'var(--loo-rouge)', fontWeight: 600, margin: '0.8rem 0 0' }}>{erreur}</p>}

      <div className="esp-grille esp-deux" style={{ marginTop: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Contrôle avant publication */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Contrôle avant publication</h2>
            {prerequis.map(([texte, ok]) => (
              <div key={texte} className="esp-liste-ligne"><span>{texte}</span><span className={`esp-puce ${ok ? 'esp-puce-vert' : 'esp-puce-rouge'}`}>{ok ? 'OK' : 'Manquant'}</span></div>
            ))}
            {!pret && f.statut !== 'publie' && <p className="esp-aide" style={{ marginTop: '0.6rem' }}>Des éléments manquent : publiez seulement si vous avez vérifié par un autre moyen.</p>}
          </div>

          {/* Informations privées */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Informations privées <span className="esp-puce esp-puce-orange">Jamais publiques</span></h2>
            <div className="adm-prive">
              <Champ k="Téléphone" v={contact.telephone ? <a href={`tel:${contact.telephone}`} style={{ fontWeight: 700 }}><Phone size={13} style={{ verticalAlign: '-2px' }} /> {contact.telephone}</a> : null} />
              <Champ k="Adresse" v={contact.adresse || f.adresse} />
              <Champ k="Site web" v={contact.site_web || f.site_web} />
              <Champ k="WhatsApp" v={reseaux.whatsapp} />
              <Champ k="Instagram" v={reseaux.instagram} />
              <Champ k="Facebook" v={reseaux.facebook} />
            </div>
          </div>

          {/* Présentation publique */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Présentation publique</h2>
            {f.description ? <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{f.description}</p> : <p className="esp-aide">Aucune présentation.</p>}
            <div style={{ marginTop: '0.8rem' }}>
              <Champ k="Type" v={f.origine === 'grossiste_etranger_ci' ? "Grossiste étranger installé en Côte d'Ivoire" : 'Entreprise locale'} />
              <Champ k="Vues du profil" v={f.vues_profil ?? 0} />
            </div>
          </div>

          {/* Documents */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Documents administratifs</h2>
            {documents.length === 0 && <p className="esp-aide">Aucun document envoyé.</p>}
            {documents.map((d) => {
              const sd = STATUTS_DOC[d.statut] || STATUTS_DOC.en_attente;
              return (
                <div key={d.id} className="esp-liste-ligne" style={{ flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '0.9rem' }}>{TYPES_DOCUMENT[d.type] || d.type}</strong>
                    <div className="esp-aide">{d.nom_fichier}</div>
                    {d.statut === 'rejete' && d.motif_rejet && <div className="esp-aide" style={{ color: 'var(--loo-rouge)', opacity: 1 }}>Motif : {d.motif_rejet}</div>}
                  </div>
                  <div className="adm-actions" style={{ alignItems: 'center' }}>
                    <span className={`esp-puce ${sd.classe}`}>{sd.texte}</span>
                    <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => voirDocument(d)}><Eye size={14} /> Consulter</button>
                    {d.statut !== 'verifie' && <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => agir(() => deciderDocument(d.id, 'verifie'))}><Check size={14} /></button>}
                    {d.statut !== 'rejete' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setModal({ type: 'document', document: d })}><X size={14} /></button>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Photos */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Photos de l'entreprise ({photos.length})</h2>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              {photos.map((p) => <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="esp-vignette" style={{ width: 130, height: 100 }}><img src={p.url} alt="Photo de l'entreprise" /></a>)}
              {f.logo_url && <a href={f.logo_url} target="_blank" rel="noreferrer" className="esp-vignette" style={{ width: 100, height: 100 }} title="Logo"><img src={f.logo_url} alt="Logo" /></a>}
              {f.banniere_url && <a href={f.banniere_url} target="_blank" rel="noreferrer" className="esp-vignette" style={{ width: 200, height: 100 }} title="Bannière"><img src={f.banniere_url} alt="Bannière" /></a>}
              {photos.length === 0 && !f.logo_url && !f.banniere_url && <p className="esp-aide">Aucune image.</p>}
            </div>
            <p className="esp-aide" style={{ marginTop: '0.6rem' }}>Vérifiez qu'aucune image ne montre un numéro ou un contact.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Produits */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Produits ({produits.length})</h2>
            {produits.length === 0 && <p className="esp-aide">Aucun produit.</p>}
            {produits.map((p) => {
              const sp = STATUTS_PRODUIT[p.statut] || STATUTS_PRODUIT.en_attente;
              return (
                <div key={p.id} className="esp-liste-ligne" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.7rem', minWidth: 0, flex: '1 1 220px' }}>
                    {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} /> : <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--loo-papier-ombre)', flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.92rem' }}>{p.nom}</strong>
                      <div className="esp-aide">{formatPrix(p.prix_gros_fcfa)} · min. {p.moq}{p.stock_disponible != null ? ` · stock ${p.stock_disponible}` : ''}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                        <span className={`esp-puce ${sp.classe}`}>{sp.texte}</span>
                        {!p.actif && <span className="esp-puce esp-puce-neutre">Désactivé</span>}
                        {p.drapeau_coordonnees && <span className="esp-puce esp-puce-orange">Coordonnées</span>}
                        {p.stock_verifie_le
                          ? <span className="esp-puce esp-puce-vert" title={formatDateHeure(p.stock_verifie_le)}>Stock vérifié</span>
                          : <span className="esp-puce esp-puce-neutre">Stock non vérifié</span>}
                      </div>
                      {p.statut === 'rejete' && p.motif_rejet && <div className="esp-aide" style={{ color: 'var(--loo-rouge)', opacity: 1 }}>Motif : {p.motif_rejet}</div>}
                    </div>
                  </div>
                  <div className="adm-actions">
                    {p.statut !== 'publie' && <button type="button" className="btn adm-bouton-petit adm-bouton-succes" onClick={() => agir(() => modererProduit(p.id, 'publie'))}>Publier</button>}
                    {p.statut !== 'rejete' && <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => setModal({ type: 'produit', produit: p })}>Rejeter</button>}
                    {p.stock_disponible != null && (
                      <button type="button" className="btn btn-outline adm-bouton-petit" onClick={() => agir(() => verifierStock(p.id, !p.stock_verifie_le))}>
                        {p.stock_verifie_le ? 'Retirer la vérif. du stock' : 'Vérifier le stock'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversations */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Conversations ({conversations.length})</h2>
            {conversations.length === 0 && <p className="esp-aide">Aucune conversation.</p>}
            {conversations.slice(0, 8).map((c) => {
              const nbSignales = (c.message || []).filter((m) => m.signale && !m.signale_traite).length;
              return (
                <Link key={c.id} to={`/conversations/${c.id}`} className="esp-liste-ligne">
                  <span style={{ fontSize: '0.9rem' }}><strong>{c.vendeur?.nom || 'Acheteur'}</strong>{c.produit?.nom ? ` · ${c.produit.nom}` : ''}</span>
                  <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {nbSignales > 0 && <span className="esp-puce esp-puce-orange">{nbSignales} signalé{nbSignales > 1 ? 's' : ''}</span>}
                    <span className="esp-aide">{formatRelatif(c.derniere_activite)}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Notes internes */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Notes internes <span className="esp-puce esp-puce-neutre">Invisibles pour le fournisseur</span></h2>
            <form onSubmit={envoyerNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <textarea className="champ" rows={2} placeholder="Ajouter une note (appel, doute, vérification faite…)" value={nouvelleNote} onChange={(e) => setNouvelleNote(e.target.value)} />
              <button type="submit" className="btn btn-primary adm-bouton-petit" disabled={!nouvelleNote.trim()}>Ajouter</button>
            </form>
            {notes.map((n) => (
              <div key={n.id} className="esp-liste-ligne" style={{ alignItems: 'flex-start' }}>
                <div><div style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{n.texte}</div><div className="esp-aide">{formatDateHeure(n.date_note)}</div></div>
                <button type="button" className="esp-bouton-icone" aria-label="Supprimer la note" onClick={() => agir(() => supprimerNote(n.id))}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          {/* Historique */}
          <div className="esp-carte">
            <h2 className="esp-carte-titre">Historique des décisions</h2>
            {journal.length === 0 && <p className="esp-aide">Aucune décision enregistrée.</p>}
            {journal.map((l) => (
              <div key={l.id} className="esp-liste-ligne">
                <span style={{ fontSize: '0.88rem' }}>{ACTIONS_JOURNAL[l.action] || l.action}{l.details?.apres != null ? ` : ${String(l.details.avant)} → ${String(l.details.apres)}` : ''}</span>
                <span className="esp-aide">{formatDateHeure(l.date_action)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal?.type === 'suspendre' && (
        <MotifModal
          titre={`Suspendre ${f.nom}`} description="Le fournisseur disparaît de la plateforme et verra ce motif dans son espace." modeles={MODELES_MOTIFS.fournisseur}
          libelleBouton="Suspendre" danger onConfirmer={(motif) => deciderFournisseur(f.id, 'suspendu', motif).then(async () => { await charger(); rafraichir(); })} onFermer={() => setModal(null)}
        />
      )}
      {modal?.type === 'produit' && (
        <MotifModal
          titre={`Rejeter « ${modal.produit.nom} »`} description="Le fournisseur verra ce motif et pourra corriger puis resoumettre le produit." modeles={MODELES_MOTIFS.produit}
          libelleBouton="Rejeter le produit" danger onConfirmer={(motif) => modererProduit(modal.produit.id, 'rejete', motif).then(async () => { await charger(); rafraichir(); })} onFermer={() => setModal(null)}
        />
      )}
      {modal?.type === 'document' && (
        <MotifModal
          titre="Rejeter ce document" modeles={MODELES_MOTIFS.document} libelleBouton="Rejeter" danger
          onConfirmer={(motif) => deciderDocument(modal.document.id, 'rejete', motif).then(async () => { await charger(); rafraichir(); })} onFermer={() => setModal(null)}
        />
      )}
    </>
  );
}

function Champ({ k, v }) {
  return (
    <div className="adm-champ-ligne">
      <span>{k}</span>
      <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{v || v === 0 ? v : <em style={{ opacity: 0.5, fontWeight: 400 }}>Non renseigné</em>}</span>
    </div>
  );
}
