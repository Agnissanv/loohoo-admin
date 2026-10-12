import React from 'react';
import { DEMONSTRATION } from '../api/loohoo.js';

/*
  Bandeau de rappel de l'origine des chiffres.
  En démonstration locale, les blocs viennent des maquettes : la pastille le dit.
  En ligne (ou en local sans démonstration), les blocs lisent la base LOOHOO :
  la pastille annonce alors « base réelle », pour ne jamais faire croire à des
  chiffres d'exemple.
*/
export default function BandeauFictif({ texte }) {
  return (
    <div className="loo-admin-bandeau">
      <span className="loo-admin-bandeau-pastille">
        {DEMONSTRATION ? 'démo' : 'base réelle'}
      </span>
      <span className="loo-admin-bandeau-texte">{texte}</span>
    </div>
  );
}
