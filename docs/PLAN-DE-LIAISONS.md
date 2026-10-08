# LOOHOO Admin — liaisons entre écrans (inventaire)

> **But** : lister **tous** les boutons / sections / lignes qui doivent **ouvrir un autre
> écran** au lieu de rester décoratifs, pour chaque page de la section admin.
> Deux colonnes comptent : la **cible** et **l'état** (relié / à relier / en attente).
>
> Règle de travail : une section qui **pointe vers une page qui n'existe pas encore**
> reste en attente — on ne la câble pas sur du générique.
> Dernière mise à jour : 09/10/2026.

## Écrans de la section admin (routes existantes)

| Route | Écran | Fichier |
|---|---|---|
| `/` | Général (tableau de bord super-admin) | `src/pages/TableauDeBord.jsx` |
| `/fournisseurs` | Module Fournisseurs (n02) | `src/pages/EspaceFournisseurs.jsx` |
| `/fournisseurs/en-attente` | File de validation des fournisseurs | `src/pages/FileValidation.jsx` |
| `/moderateur` | Espace modérateur, persona Anno (n03) | `src/pages/EspaceModerateur.jsx` |
| `/service-client` | Service client & litiges, persona Marie C. (n04) | `src/pages/ServiceClientLitiges.jsx` |
| `/boutiques` | Boutiques | `src/pages/Boutiques.jsx` |
| `/connexion` | Connexion admin | `src/pages/Connexion.jsx` |

## 1. Barre de navigation (`NavAdmin`) — **reliée**

| Élément | Cible | État |
|---|---|---|
| Général | `/` | ✅ relié |
| Fournisseurs | `/fournisseurs` | ✅ relié |
| Modérateur | `/moderateur` | ✅ relié |
| Service client | `/service-client` | ✅ relié |
| Boutiques 🔒 | `/boutiques` | ✅ relié (cadenas = repère visuel, la page existe) |
| Se déconnecter | fin de session | ✅ relié |

## 2. Écran « Général » (`/`)

| Élément | Cible | État |
|---|---|---|
| Raccourci « Fournisseurs » (profil) | `/fournisseurs` | ✅ relié |
| Raccourci « Boutiques » (profil) | `/boutiques` | ✅ relié |
| KPI Fournisseurs / Publiés / Vérifiés / En attente | `/fournisseurs` | ✅ relié |
| Section « File d'action » → « Voir la file complète » | `/fournisseurs` | ✅ relié |
| Carte latérale « Litiges » | `/service-client` | ✅ relié |
| Carte latérale « Alertes stock » | `/service-client` | ✅ relié |
| Carte « Aperçu — espace modérateur » | `/moderateur` | ✅ relié |
| KPI « Produits » / « Produits en attente » | écran Produits | ⏳ page à créer |
| KPI « Contacts (7 j) » | écran Conversations (messagerie) | ⏳ page à créer |
| Ligne fournisseur → « Détail » | fiche fournisseur `/fournisseurs/:id` | ⏳ page à créer (aujourd'hui déplié sur place) |
| Carte « Parrainages » | écran Parrainages | ⏳ page à créer |
| Carte « Journal des décisions » | écran Journal d'audit | ⏳ page à créer |
| Carte « Votre équipe & rôles » + « Ajouter un membre » | écran Équipe & rôles | ⏳ page à créer |
| Carte « Historique de connexion » | écran Connexions | ⏳ page à créer |
| Mini « Recherches sans résultat » (Surveillance) | écran Demandes non couvertes | ⏳ page à créer |
| Boutique « Ouvrir son admin » | admin de la boutique (lien externe) | ✅ déjà relié |
| « Feuille de route LOOHOO » | — (contenu, pas un lien) | ✔️ sans objet |

## 3. Écran « Fournisseurs » (`/fournisseurs`, n02)

| Élément | Cible | État |
|---|---|---|
| Onglets de la courbe (Fournisseurs / Produits / Acheteurs / Demandes) | change la courbe sur place | ✅ déjà relié |
| « 🏭 6 — Fournisseurs à valider » (bloc À traiter) | `/fournisseurs/en-attente` | ✅ relié |
| « 🤝 2 — Litiges en attente » (bloc À traiter) | `/service-client` | ✅ relié |
| « 📈 612 000 FCFA — Revenu LOOHOO ce mois » (Aperçu) | `/` (section CA) | ✅ relié |
| « ⚠️ 2 — Coordonnées détectées » (bloc À traiter) | file des messages à contrôler | ⏳ page à créer |
| « 🔗 23 / 7 — Filleuls actifs » (Aperçu) | écran Parrainages | ⏳ page à créer |

## 4. Écran « Modérateur » (`/moderateur`, n03)

| Élément | Cible | État |
|---|---|---|
| « 🏭 6 — Fournisseurs à vérifier » (File d'attente) | `/fournisseurs/en-attente` | ✅ relié |
| « ⏱️ 1 — ⚠ en attente depuis 48 h » (File d'attente) | `/fournisseurs/en-attente` | ✅ relié |
| « 🏭 340 — Fournisseurs actifs » (Fournisseurs publiés) | `/fournisseurs` | ✅ relié |
| « 👥 2 — Commerciaux terrain actifs » (Vos commerciaux) | écran Commercial terrain (Équipe & rôles) | ⏳ page à créer |
| « ✉ Contacter le commercial » (dossier) | messagerie interne (numéros masqués) | ⏳ page à créer (aujourd'hui ancre `#contact`) |
| « ✓ Valider ma journée », « Rejeter », « ✓ Valider » | action sur place (rien n'est enregistré) | ✅ déjà en place |

## 5. Écran « Service client & litiges » (`/service-client`, n04)

| Élément | Cible | État |
|---|---|---|
| Bascule « ⚖️ Litiges / 📞 Call center » | change d'onglet sur place | ✅ déjà relié |
| « ⭐ Koné Textiles — Note 1★ détectée » (File litiges) | détail du litige | ⏳ données réelles requises |
| « 📦 Koné Textiles — remontée suspecte » (Alertes stock) | dossier de l'alerte | ⏳ données réelles requises |
| « 📞 Électro Plus CI — relancé hier » (Alertes stock) | dossier de l'alerte | ⏳ données réelles requises |
| « 💬 Voir la conversation complète » | conversation du litige | ⏳ données réelles requises |
| « 📎 2 preuves jointes » | pièces jointes du litige | ⏳ données réelles requises |
| Boutons « Paiement / Délai / Autre » | choix du type sur place | ✅ déjà relié |
| « ⤴ Escalader », « ✓ Marquer résolu » | décision sur place (rien n'est enregistré) | ✅ déjà relié |

## 6. Écran « Boutiques » (`/boutiques`)

| Élément | Cible | État |
|---|---|---|
| Cartes boutiques | admin de chaque boutique | ⏳ à décider (lien externe, comme dans Général) |

## Ce qui est attendu (pages à créer, dans l'ordre utile)

1. `/fournisseurs/en-attente` — file de validation (le « 6 Fournisseurs à valider ») → **créé le 09/10/2026**.
2. Écran **Produits** (publication, attente, catégories).
3. Écran **Conversations** (messagerie interne, numéros masqués).
4. Écran **Demandes non couvertes** (recherches sans résultat) — priorité haute dans la spec.
5. Écran **Commercial terrain** (objectif hebdo, taux de validation, primes).
6. Écran **Équipe & rôles** (+ commerciaux), **Journal d'audit**, **Connexions**, **Parrainages**.
7. Fiche **fournisseur** (`/fournisseurs/:id`) et **détail litige** quand les tables existeront.
