import React, { useState } from 'react';

/*
  Courbe à onglets (maquette n02, « Espace fournisseurs »).
  Un onglet par série ; la courbe est un simple tracé SVG (pas de dépendance).
  Les valeurs viennent de données fictives : voir src/api/donnees-espaces.js.
*/
export default function CourbeOnglets({ series, ongletInitial }) {
  const [actif, setActif] = useState(ongletInitial || series[0].cle);
  const serie = series.find((s) => s.cle === actif) || series[0];

  const trace = serie.points
    .map((y, i) => `${10 + (i * 300) / (serie.points.length - 1)},${y}`)
    .join(' ');

  return (
    <div className="loo-admin-carte loo-esp-courbe">
      <div className="loo-admin-onglets">
        {series.map((s) => (
          <button
            key={s.cle}
            type="button"
            className={`loo-admin-onglet${s.cle === actif ? ' actif' : ''}`}
            onClick={() => setActif(s.cle)}
          >
            {s.libelle}
          </button>
        ))}
      </div>

      <div className="loo-esp-courbe-tete">
        <span className="loo-esp-courbe-valeur">{serie.valeur}</span>
        <span className="loo-esp-courbe-hausse">{serie.hausse}</span>
      </div>

      <svg
        viewBox="0 0 320 90"
        preserveAspectRatio="none"
        role="img"
        aria-label={serie.valeur}
      >
        <polygon
          points={`${trace} 280,85 10,85`}
          fill="var(--loo-papier-ombre)"
          opacity="0.55"
        />
        <polyline
          points={trace}
          fill="none"
          stroke="var(--loo-orange)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <p className="loo-admin-note">{serie.note}</p>
    </div>
  );
}
