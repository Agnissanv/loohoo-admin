import React from 'react';

/*
  Bandeau de rappel « données fictives ».
  Les chiffres des écrans d'espace (maquettes du client) ne viennent d'aucune
  source réelle : ce bandeau le dit à l'écran, comme sur le tableau de bord.
*/
export default function BandeauFictif({ texte }) {
  return (
    <div className="loo-admin-bandeau">
      <span className="loo-admin-bandeau-pastille">démo</span>
      <span className="loo-admin-bandeau-texte">{texte}</span>
    </div>
  );
}
