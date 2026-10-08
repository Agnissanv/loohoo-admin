# LOOHOO Admin — plan de travail & point de reprise

> **À lire en premier si tu reprends ce dépôt.** Dernière mise à jour : 09/10/2026.
> La spec complète est dans [`CAHIER-DES-CHARGES-v3.md`](./CAHIER-DES-CHARGES-v3.md).
> Les écrans cibles fournis par le client sont dans [`maquettes/`](./maquettes/).

## Le travail demandé

Le client (le boss) a envoyé **un document de référence** (« fiche technique v3 »)
+ **4 maquettes d'écrans**. Ce qu'il attend : que le panneau d'administration
de LOOHOO soit **construit conformément à ces 4 écrans**, et que les 17 évolutions
du document soient intégrées.

## Branche de travail

- Branche de travail : **`yoann-dev`** (ne jamais pousser sur `main`).
- Dépôt : `Agnissanv/loohoo-admin` (collaborateur : `Yoannta`).

## Comment lancer en local

```bash
npm install
# démo locale sans base : variables dans .env.local
#   VITE_DEMO_ADMIN=1
npm run dev        # http://localhost:5173
npm run build      # vérif avant commit (doit passer)
```

## Ce qui est déjà en place

- **Écran « Général »** = tableau de bord super-admin (`src/pages/TableauDeBord.jsx`) :
  profil connecté, santé de la plateforme (données réelles), chiffre d'affaires
  (courbe à onglets Revenu/GMV/Fournisseurs/Acheteurs), santé du réseau, surveillance,
  file d'action des fournisseurs (publier/suspendre, actions groupées, recherche),
  boutiques, et colonne latérale (litiges, alertes stock, parrainages, journal des
  décisions, équipe, connexions, feuille de route).
- **Page Boutiques** (`src/pages/Boutiques.jsx`).
- **Écrans des rôles (maquettes n02/n03/n04) — construits le 09/10/2026** :
  - `src/pages/EspaceFournisseurs.jsx` → route `/fournisseurs` (hero 4 chiffres,
    courbe à onglets via `CourbeOnglets`, « À traiter », « Aperçu rapide »).
  - `src/pages/EspaceModerateur.jsx` → route `/moderateur` (Votre journée, dossier
    en cours avec documents/infos/checklist/motif, valider/rejeter, file d'attente,
    fournisseurs publiés, commerciaux).
  - `src/pages/ServiceClientLitiges.jsx` → route `/service-client` (bascule
    ⚖️ Litiges / 📞 Call center, dossier de litige, file des litiges, alertes stock).
  - Navigation : `src/components/NavAdmin.jsx` (Général / Fournisseurs / Modérateur /
    Service client / Boutiques 🔒 — verrou visuel seulement pour l'instant).
  - Valeurs des écrans isolées dans `src/api/donnees-espaces.js` (mêmes règles que
    `donnees-fictives.js`) ; styles dans `src/admin-espaces.css`.
- **Liaisons entre écrans — câblées le 09/10/2026** (inventaire complet :
  [`PLAN-DE-LIAISONS.md`](./PLAN-DE-LIAISONS.md)) : les sections/lignes qui mènent à un
  écran existant sont de vrais liens (`<Link>`), plus des blocs inertes. Nouvelle page
  `src/pages/FileValidation.jsx` → route **`/fournisseurs/en-attente`** (« 🏭 6 Fournisseurs
  à valider » des maquettes n02/n03). Composant `src/components/ItemEspace.jsx` = ligne
  « bouton si aucune cible, lien sinon » ; styles dans `src/admin-liaisons.css`.
- Blocs **sans source de données** clairement marqués « fictif » à l'écran, valeurs
  isolées dans un seul fichier : `src/api/donnees-fictives.js` (aucune lecture en base).
- Le bandeau en haut de page rappelle que ces blocs ne sont branchés sur rien.

## Prochaines étapes, dans l'ordre

1. **Corriger le modèle de facturation** partout où un champ parle de « commission » :
   c'est un **abonnement** → « Revenu LOOHOO (abonnements actifs) ». *(cf. spec — point urgent)*
2. ~~Construire les 3 écrans qui manquent (n02, n03, n04)~~ → **fait** (routes
   `/fournisseurs`, `/moderateur`, `/service-client`). Reste à faire relire par le client.
3. **Écran Commercial terrain** : décrit dans la spec mais **aucune maquette fournie** →
   à dessiner puis à construire (objectif hebdo, taux de validation, primes, « Ajouter un
   fournisseur » en brouillon).
4. **Rôles et permissions** : navigation qui change selon le rôle (super-admin, modérateur,
   service client & litiges, commercial terrain), avec champ **zone/pays** dès le départ.
   Aujourd'hui la barre montre les 5 entrées : chaque écran de rôle porte déjà sa
   persona de démo (Anno, Marie C.).
5. **Brancher les blocs « fictifs »** au fur et à mesure que les tables existent
   (message, avis, favori, demande, litige, vue_profil, recherche_sans_resultat,
   session_connexion…). Tant qu'une table n'existe pas : le bloc reste marqué « fictif ».
6. **Écran « Demandes non couvertes »** (recherches sans résultat) — priorité haute
   dans la spec.
7. **Sécurité admin** : 2FA, déconnexion automatique, journal d'audit des actions.
8. **Ouvrir les écrans intermédiaires** annoncés par les maquettes (détail fournisseur,
   file d'attente complète avec recherche, conversation complète d'un litige, « À traiter »,
   Produits, Acheteurs, Conversations, Affaires & abonnements, Leads, Catégories,
   Journal d'audit, Équipe & rôles). **État des liaisons : [`PLAN-DE-LIAISONS.md`](./PLAN-DE-LIAISONS.md)**
   — au 09/10/2026 toutes les liaisons dont la page existe sont câblées (voir ci-dessus) ;
   celles qui pointent vers une page encore inexistante **restent volontairement en attente**
   (on ne renvoie personne vers du contenu générique).

## Règles à respecter (rappel)

- **Jamais de commission** (c'est un abonnement) — jamais de chiffre d'exemple codé en dur.
- Téléphones **masqués** dans la messagerie ; badge « vérifié » **au niveau du profil**.
- Aucun **texte d'interface en dur** (prévoir la traduction fr → en).
- Écarts entre ce que montre une maquette et ce que la base peut fournir :
  **le bloc reste marqué « fictif »**, on n'invente pas une source.

## Ce qu'il faut demander / trancher (pas dans le code)

Seuil d'abonnement, paliers de parrainage, solution SMS/OTP, agrégateur Mobile Money,
méthode du prix de référence des « économies ». Liste complète en fin de
`CAHIER-DES-CHARGES-v3.md`.
