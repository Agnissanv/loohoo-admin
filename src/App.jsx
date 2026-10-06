import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Connexion from './pages/Connexion.jsx';
import LayoutAdmin from './components/LayoutAdmin.jsx';
import TableauDeBord from './pages/TableauDeBord.jsx';
import ATraiter from './pages/ATraiter.jsx';
import Fournisseurs from './pages/Fournisseurs.jsx';
import FicheFournisseur from './pages/FicheFournisseur.jsx';
import Produits from './pages/Produits.jsx';
import Acheteurs from './pages/Acheteurs.jsx';
import Conversations from './pages/Conversations.jsx';
import Affaires from './pages/Affaires.jsx';
import Leads from './pages/Leads.jsx';
import Journal from './pages/Journal.jsx';
import Categories from './pages/Categories.jsx';
import Equipe from './pages/Equipe.jsx';
import Boutiques from './pages/Boutiques.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route element={<LayoutAdmin />}>
        <Route path="/" element={<TableauDeBord />} />
        <Route path="/a-traiter" element={<ATraiter />} />
        <Route path="/fournisseurs" element={<Fournisseurs />} />
        <Route path="/fournisseurs/:id" element={<FicheFournisseur />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/acheteurs" element={<Acheteurs />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversations/:id" element={<Conversations />} />
        <Route path="/affaires" element={<Affaires />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/boutiques" element={<Boutiques />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/equipe" element={<Equipe />} />
      </Route>
    </Routes>
  );
}
