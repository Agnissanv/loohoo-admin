import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Connexion from './pages/Connexion.jsx';
import LayoutAdmin from './components/LayoutAdmin.jsx';
import Accueil from './pages/Accueil.jsx';
import TableauFournisseurs from './pages/TableauFournisseurs.jsx';
import ATraiter from './pages/ATraiter.jsx';
import Fournisseurs from './pages/Fournisseurs.jsx';
import FicheFournisseur from './pages/FicheFournisseur.jsx';
import Produits from './pages/Produits.jsx';
import Acheteurs from './pages/Acheteurs.jsx';
import Conversations from './pages/Conversations.jsx';
import Affaires from './pages/Affaires.jsx';
import Leads from './pages/Leads.jsx';
import Categories from './pages/Categories.jsx';
import TableauBoutiques from './pages/TableauBoutiques.jsx';
import Boutiques from './pages/Boutiques.jsx';
import LeadsBoutiques from './pages/LeadsBoutiques.jsx';
import Journal from './pages/Journal.jsx';
import Equipe from './pages/Equipe.jsx';

// Anciennes adresses (avant la séparation en deux espaces) : on redirige pour que les favoris continuent de marcher
function Redirection({ vers }) {
  const params = useParams();
  const { search } = useLocation();
  return <Navigate to={`${vers(params)}${search}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route element={<LayoutAdmin />}>
        {/* Accueil et pages communes */}
        <Route path="/" element={<Accueil />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/equipe" element={<Equipe />} />

        {/* Espace Fournisseurs : la plateforme de sourcing B2B */}
        <Route path="/f" element={<TableauFournisseurs />} />
        <Route path="/f/a-traiter" element={<ATraiter />} />
        <Route path="/f/fournisseurs" element={<Fournisseurs />} />
        <Route path="/f/fournisseurs/:id" element={<FicheFournisseur />} />
        <Route path="/f/produits" element={<Produits />} />
        <Route path="/f/acheteurs" element={<Acheteurs />} />
        <Route path="/f/conversations" element={<Conversations />} />
        <Route path="/f/conversations/:id" element={<Conversations />} />
        <Route path="/f/affaires" element={<Affaires />} />
        <Route path="/f/leads" element={<Leads />} />
        <Route path="/f/categories" element={<Categories />} />

        {/* Espace Boutiques : la plateforme de création de boutiques */}
        <Route path="/b" element={<TableauBoutiques />} />
        <Route path="/b/boutiques" element={<Boutiques />} />
        <Route path="/b/leads" element={<LeadsBoutiques />} />

        {/* Anciennes adresses */}
        <Route path="/a-traiter" element={<Redirection vers={() => '/f/a-traiter'} />} />
        <Route path="/fournisseurs" element={<Redirection vers={() => '/f/fournisseurs'} />} />
        <Route path="/fournisseurs/:id" element={<Redirection vers={({ id }) => `/f/fournisseurs/${id}`} />} />
        <Route path="/produits" element={<Redirection vers={() => '/f/produits'} />} />
        <Route path="/acheteurs" element={<Redirection vers={() => '/f/acheteurs'} />} />
        <Route path="/conversations" element={<Redirection vers={() => '/f/conversations'} />} />
        <Route path="/conversations/:id" element={<Redirection vers={({ id }) => `/f/conversations/${id}`} />} />
        <Route path="/affaires" element={<Redirection vers={() => '/f/affaires'} />} />
        <Route path="/leads" element={<Redirection vers={() => '/f/leads'} />} />
        <Route path="/categories" element={<Redirection vers={() => '/f/categories'} />} />
        <Route path="/boutiques" element={<Redirection vers={() => '/b/boutiques'} />} />
      </Route>
    </Routes>
  );
}
