import React from 'react';
import { Link } from 'react-router-dom';

/*
  Ligne d'écran d'espace (maquettes n02/n03/n04).

  - si la donnée porte une cible (`to`), la ligne est un LIEN vers la page dédiée ;
  - sinon c'est un bouton inerte (la page cible n'existe pas encore — on ne
    renvoie jamais vers du contenu générique).

  Aucune donnée n'est lue ni écrite : la cible vient de src/api/donnees-espaces.js.
*/
export default function ItemEspace({ to, className = 'loo-esp-item', children }) {
  if (to) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}
