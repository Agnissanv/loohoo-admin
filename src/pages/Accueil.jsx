import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Factory, ScrollText, Settings, Store } from 'lucide-react';
import { recupererLeads, recupererStatsBoutiques } from '../api/admin.js';
import { supabase } from '../supabaseClient.js';
import { useAdminDonnees } from '../hooks/useAdminDonnees.js';

// Page d'accueil : le point de départ qui sépare clairement les deux plateformes de LOOHOO
export default function Accueil() {
  const { compteurs: c, superAdmin } = useOutletContext();
  const leads = useAdminDonnees(recupererLeads);
  const boutiques = useAdminDonnees(() => supabase.auth.getSession().then(({ data }) => recupererStatsBoutiques(data.session.access_token)).catch(() => []));

  const demandesOuverture = (leads.donnees || []).filter((l) => String(l.recherche || '').startsWith('landing-')).length;
  const nbBoutiques = (boutiques.donnees || []).filter((b) => !b.erreur).length;
  const aTraiter = c ? c.fournisseurs.en_attente + c.produits.en_attente + c.documents_en_attente + c.messages.signales + (c.affaires?.contestees || 0) : null;

  return (
    <>
      <div className="esp-bandeau" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div>
          <h1>Administration LOOHOO</h1>
          <p>LOOHOO regroupe deux plateformes. Choisissez celle que vous voulez piloter : chacune a son propre espace, ses écrans et sa couleur.</p>
        </div>
      </div>

      <div className="esp-grille esp-deux" style={{ marginTop: '1.2rem' }}>
        <Link to="/f" className="adm-carte-espace adm-carte-fournisseurs">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem' }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF1E0', color: '#EF4136', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Factory size={26} /></span>
            <span><strong style={{ fontSize: '1.35rem', fontFamily: 'var(--police-affiche)' }}>Fournisseurs</strong><span className="esp-puce esp-puce-vert" style={{ marginLeft: '0.6rem' }}>En service</span></span>
          </span>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.55 }}>La plateforme de sourcing B2B : fournisseurs, produits, acheteurs, conversations, affaires et commissions.</p>
          {c ? (
            <div className="adm-stats-ligne">
              <div><strong style={{ color: aTraiter > 0 ? '#EF4136' : undefined }}>{aTraiter}</strong><span>à traiter</span></div>
              <div><strong>{c.fournisseurs.publies}</strong><span>fournisseurs publiés</span></div>
              <div><strong>{c.produits.publies}</strong><span>produits publiés</span></div>
              <div><strong>{c.acheteurs.total}</strong><span>acheteurs</span></div>
            </div>
          ) : <div className="loo-squelette" style={{ height: 50 }} />}
          <span className="btn btn-primary" style={{ justifyContent: 'center', background: '#EF4136' }}>Ouvrir l'espace Fournisseurs <ArrowRight size={16} /></span>
        </Link>

        <Link to="/b" className="adm-carte-espace adm-carte-boutiques">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem' }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: '#E6F6F4', color: '#0F766E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Store size={26} /></span>
            <span><strong style={{ fontSize: '1.35rem', fontFamily: 'var(--police-affiche)' }}>Boutiques</strong><span className="esp-puce esp-puce-orange" style={{ marginLeft: '0.6rem' }}>En préparation</span></span>
          </span>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.55 }}>La plateforme de création de boutiques en ligne (type Shopify, pour l'Afrique) : boutiques, abonnements, demandes d'ouverture.</p>
          <div className="adm-stats-ligne">
            <div><strong>{boutiques.donnees === undefined ? '…' : nbBoutiques}</strong><span>boutique{nbBoutiques > 1 ? 's' : ''} connectée{nbBoutiques > 1 ? 's' : ''}</span></div>
            <div><strong>{leads.donnees === undefined ? '…' : demandesOuverture}</strong><span>demandes d'ouverture</span></div>
          </div>
          <span className="btn btn-primary" style={{ justifyContent: 'center', background: '#0F766E' }}>Ouvrir l'espace Boutiques <ArrowRight size={16} /></span>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.1rem', margin: '1.8rem 0 0.8rem' }}>Général</h2>
      <div className="esp-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Link to="/journal" className="esp-carte adm-kpi-lien" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <ScrollText size={22} color="var(--loo-rouge)" />
          <span><strong>Journal d'audit</strong><span className="esp-aide" style={{ display: 'block' }}>Toutes les décisions de l'équipe, sur les deux plateformes.</span></span>
        </Link>
        {superAdmin && (
          <Link to="/equipe" className="esp-carte adm-kpi-lien" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Settings size={22} color="var(--loo-rouge)" />
            <span><strong>Équipe d'administration</strong><span className="esp-aide" style={{ display: 'block' }}>Qui a accès à l'administration, et avec quel rôle.</span></span>
          </Link>
        )}
      </div>
    </>
  );
}
