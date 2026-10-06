import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, Factory, FileText, Handshake, MessageSquare, Package, ShieldCheck } from 'lucide-react';

export default function TableauDeBord() {
  const { compteurs: c } = useOutletContext();
  if (!c) return <div className="loo-squelette" style={{ height: '260px' }} />;

  const aTraiter = [
    { texte: 'Fournisseurs à valider', valeur: c.fournisseurs.en_attente, vers: '/a-traiter?onglet=fournisseurs', icone: Factory },
    { texte: 'Produits à valider', valeur: c.produits.en_attente, vers: '/a-traiter?onglet=produits', icone: Package },
    { texte: 'Documents à vérifier', valeur: c.documents_en_attente, vers: '/a-traiter?onglet=documents', icone: FileText },
    { texte: 'Messages signalés', valeur: c.messages.signales, vers: '/a-traiter?onglet=messages', icone: AlertTriangle },
    ...(c.affaires ? [{ texte: 'Affaires contestées', valeur: c.affaires.contestees, vers: '/affaires?filtre=contestee', icone: Handshake }] : []),
  ];
  const total = aTraiter.reduce((n, a) => n + a.valeur, 0);

  return (
    <>
      <div className="esp-bandeau">
        <div>
          <h1>Administration LOOHOO</h1>
          <p>{total > 0 ? `${total} élément${total > 1 ? 's' : ''} attend${total > 1 ? 'ent' : ''} votre décision.` : 'Rien en attente : tout est à jour.'}</p>
        </div>
        <div className="esp-kpis">
          <Kpi etiquette="Fournisseurs publiés" valeur={c.fournisseurs.publies} />
          <Kpi etiquette="Produits publiés" valeur={c.produits.publies} />
          <Kpi etiquette="Acheteurs" valeur={c.acheteurs.total} />
          <Kpi etiquette="Demandes (7 j)" valeur={c.conversations.sept_jours} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '1.6rem 0 0.8rem' }}>À traiter</h2>
      <div className="esp-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {aTraiter.map(({ texte, valeur, vers, icone: Icone }) => (
          <Link key={texte} to={vers} className="esp-carte adm-kpi-lien" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', borderColor: valeur ? 'var(--loo-orange)' : undefined }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: valeur ? '#FFF1E0' : 'var(--loo-papier)', color: 'var(--loo-rouge)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icone size={22} /></span>
            <span><span style={{ display: 'block', fontFamily: 'var(--police-affiche)', fontWeight: 800, fontSize: '1.7rem', lineHeight: 1 }}>{valeur}</span><span style={{ fontSize: '0.84rem', opacity: 0.75 }}>{texte}</span></span>
          </Link>
        ))}
      </div>

      <div className="esp-grille esp-deux" style={{ marginTop: '1.4rem', alignItems: 'start' }}>
        <div className="esp-carte">
          <h2 className="esp-carte-titre"><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={18} /> Surveillance</span></h2>
          <Ligne texte="Demandes sans aucune réponse du fournisseur" valeur={c.conversations.sans_reponse} vers="/conversations" alerte={c.conversations.sans_reponse > 0} />
          <Ligne texte="Produits avec coordonnées détectées" valeur={c.produits.drapeaux} vers="/produits?filtre=drapeaux" alerte={c.produits.drapeaux > 0} />
          <Ligne texte="Fournisseurs avec coordonnées détectées" valeur={c.fournisseurs.drapeaux} vers="/fournisseurs" alerte={c.fournisseurs.drapeaux > 0} />
          <Ligne texte="Produits publiés au stock non vérifié" valeur={c.produits.stock_non_verifie} vers="/produits?filtre=stock" />
          <Ligne texte="Fournisseurs suspendus" valeur={c.fournisseurs.suspendus} vers="/fournisseurs?statut=suspendu" />
        </div>
        <div className="esp-carte">
          <h2 className="esp-carte-titre"><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={18} /> Activité de la plateforme</span></h2>
          <Ligne texte="Conversations ouvertes" valeur={c.conversations.total} vers="/conversations" />
          <Ligne texte="Messages échangés" valeur={c.messages.total} />
          <Ligne texte="Mises en relation enregistrées" valeur={c.mises_en_relation} />
          <Ligne texte="Fournisseurs vérifiés (badge)" valeur={c.fournisseurs.verifies} vers="/fournisseurs" />
          {c.affaires && <Ligne texte="Affaires confirmées" valeur={c.affaires.confirmees} vers="/affaires?filtre=confirmee" />}
          {c.affaires && <Ligne texte="Commission à facturer (F CFA)" valeur={Number(c.affaires.commission_a_facturer).toLocaleString('fr-FR')} vers="/affaires?filtre=confirmee" alerte={c.affaires.commission_a_facturer > 0} />}
          <Ligne texte="Leads collectés" valeur={c.leads} vers="/leads" />
          <Ligne texte="Acheteurs inscrits" valeur={c.acheteurs.total} vers="/acheteurs" />
        </div>
      </div>
      <p className="esp-aide" style={{ marginTop: '1rem' }}><ClipboardCheck size={13} style={{ verticalAlign: '-2px' }} /> Les compteurs se mettent à jour à chaque changement de page.</p>
    </>
  );
}

function Kpi({ etiquette, valeur }) {
  return <div className="esp-kpi"><div className="esp-kpi-etiquette">{etiquette}</div><div className="esp-kpi-valeur">{valeur}</div></div>;
}

function Ligne({ texte, valeur, vers, alerte }) {
  const contenu = (
    <div className="esp-liste-ligne">
      <span style={{ fontSize: '0.92rem' }}>{texte}</span>
      <strong style={{ color: alerte ? 'var(--loo-rouge)' : undefined }}>{valeur}</strong>
    </div>
  );
  return vers ? <Link to={vers}>{contenu}</Link> : contenu;
}
