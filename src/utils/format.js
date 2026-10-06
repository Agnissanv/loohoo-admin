export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
export const formatDateHeure = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–');
export const formatHeure = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
export const formatJour = (iso) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
export const formatPrix = (n) => (n == null ? '–' : `${Number(n).toLocaleString('fr-FR')} F CFA`);
export const initiales = (nom = '') => nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]).join('').toUpperCase() || '?';

export function formatRelatif(iso) {
  const date = new Date(iso);
  const minutes = Math.round((Date.now() - date) / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (minutes < 60 * 24) return `Il y a ${Math.round(minutes / 60)} h`;
  if (minutes < 60 * 24 * 7) return `Il y a ${Math.round(minutes / 1440)} j`;
  return formatDate(iso);
}

export const STATUTS_FOURNISSEUR = {
  en_attente: { texte: 'En attente', classe: 'esp-puce-orange' },
  publie: { texte: 'Publié', classe: 'esp-puce-vert' },
  suspendu: { texte: 'Suspendu', classe: 'esp-puce-rouge' },
};
export const STATUTS_PRODUIT = {
  en_attente: { texte: 'En attente', classe: 'esp-puce-orange' },
  publie: { texte: 'Publié', classe: 'esp-puce-vert' },
  rejete: { texte: 'Rejeté', classe: 'esp-puce-rouge' },
};
export const TYPES_DOCUMENT = {
  rccm: 'RCCM / Extrait Kbis',
  piece_identite: "Pièce d'identité",
  attestation_residence: 'Attestation de résidence',
  certificat_conformite: 'Certificat de conformité',
  autre: 'Autre document',
};

// Motifs proposés pour gagner du temps (modifiables avant l'envoi)
export const MODELES_MOTIFS = {
  fournisseur: [
    "Documents illisibles ou incomplets : merci de les renvoyer.",
    "Photos de l'entreprise manquantes ou non conformes.",
    'Informations incohérentes entre le profil et les documents.',
    "Coordonnées (téléphone, e-mail, lien) présentes dans le profil : à retirer.",
  ],
  produit: [
    'Photo absente ou de mauvaise qualité.',
    'Description insuffisante : merci de préciser les caractéristiques.',
    'Prix ou quantité minimale incohérents.',
    "Coordonnées (téléphone, e-mail, lien) présentes dans la fiche : à retirer.",
    'Produit non conforme aux règles de la plateforme.',
  ],
  document: [
    'Document illisible.',
    'Document expiré ou non conforme.',
    "Le nom ne correspond pas à celui de l'entreprise.",
  ],
};

export function exporterCsv(nom, colonnes, lignes) {
  const echapper = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const contenu = [colonnes.map((c) => echapper(c.titre)).join(';'), ...lignes.map((l) => colonnes.map((c) => echapper(c.valeur(l))).join(';'))].join('\r\n');
  const blob = new Blob([`\uFEFF${contenu}`], { type: 'text/csv;charset=utf-8' });
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = `${nom}-${new Date().toISOString().slice(0, 10)}.csv`;
  lien.click();
  URL.revokeObjectURL(lien.href);
}
