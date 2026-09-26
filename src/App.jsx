import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Connexion from './pages/Connexion.jsx';
import TableauDeBord from './pages/TableauDeBord.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/" element={<TableauDeBord />} />
    </Routes>
  );
}