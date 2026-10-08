import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Connexion from './pages/Connexion.jsx';
import TableauDeBord from './pages/TableauDeBord.jsx';
import EspaceFournisseurs from './pages/EspaceFournisseurs.jsx';
import FileValidation from './pages/FileValidation.jsx';
import EspaceModerateur from './pages/EspaceModerateur.jsx';
import ServiceClientLitiges from './pages/ServiceClientLitiges.jsx';
import Boutiques from './pages/Boutiques.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/" element={<TableauDeBord />} />
      <Route path="/fournisseurs" element={<EspaceFournisseurs />} />
      <Route path="/fournisseurs/en-attente" element={<FileValidation />} />
      <Route path="/moderateur" element={<EspaceModerateur />} />
      <Route path="/service-client" element={<ServiceClientLitiges />} />
      <Route path="/boutiques" element={<Boutiques />} />
    </Routes>
  );
}
