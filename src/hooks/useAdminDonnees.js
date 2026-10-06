import { useCallback, useEffect, useState } from 'react';

// Charge des données au montage et permet de recharger après une action.
// donnees : undefined = chargement en cours, sinon le résultat. erreur : message lisible.
export function useAdminDonnees(chargeur, dependances = []) {
  const [donnees, setDonnees] = useState(undefined);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(() => {
    setErreur('');
    return chargeur().then(setDonnees).catch((err) => { setErreur(err.message || 'Chargement impossible.'); setDonnees((d) => d ?? null); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependances);

  useEffect(() => { recharger(); }, [recharger]);

  return { donnees, erreur, recharger };
}
