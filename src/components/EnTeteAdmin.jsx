import React from 'react';
import NavAdmin from './NavAdmin.jsx';

/*
  En-tête de page admin : logo + marque + libellé de la vue.
  Même structure que l'en-tête déjà en place dans TableauDeBord.jsx, mise en
  composant pour les écrans d'espace (fournisseurs, modérateur, service client).
*/
export default function EnTeteAdmin({ vue }) {
  return (
    <header className="loo-admin-tete">
      <div className="loo-admin-marque">
        <img src="/logo.jpeg" alt="" className="loo-admin-logo" />
        <span>
          <strong className="loo-admin-marque-nom">LOOHOO</strong>
          <span className="loo-admin-marque-sous">B2B Commerce</span>
        </span>
      </div>
      <div className="loo-admin-vue">{vue}</div>
    </header>
  );
}

export { NavAdmin };
