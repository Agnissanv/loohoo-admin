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
- Blocs **sans source de données** clairement marqués « fictif » à l'écran, valeurs
  isolées dans un seul fichier : `src/api/donnees-fictives.js` (aucune lecture en base).
- Le bandeau en haut de page rappelle que ces blocs ne sont branchés sur rien.

## Prochaines étapes, dans l'ordre

1. **Corriger le modèle de facturation** partout où un champ parle de « commission » :
   c'est un **abonnement** → « Revenu LOOHOO (abonnements actifs) ». *(cf. spec — point urgent)*
2. **Construire les 3 écrans qui manquent**, à partir des maquettes fournies :
   - `n02` — le **module Fournisseurs** vu par l'admin (aujourd'hui : file d'action
     intégrée à « Général » ; à sortir dans son propre écran, avec sa propre courbe
     « Fournisseurs publiés / Produits / Acheteurs / Demandes 7 j » et son bloc « À traiter »).
   - `n03` — l'**espace modérateur** (Anno) : « Votre journée », dossier en cours
     (checklist + motif obligatoire + rejeter/valider), file d'attente, fournisseurs publiés.
   - `n04` — **Service client & litiges** (Marie) : sélecteur « ⚖️ Litiges / 📞 Call center »,
     dossier de litige, file des litiges, alertes stock.
3. **Écran Commercial terrain** : décrit dans la spec mais **aucune maquette fournie** →
   à dessiner puis à construire (objectif hebdo, taux de validation, primes, « Ajouter un
   fournisseur » en brouillon).
4. **Rôles et permissions** : navigation qui change selon le rôle (super-admin, modérateur,
   service client & litiges, commercial terrain), avec champ **zone/pays** dès le départ.
5. **Brancher les blocs « fictifs »** au fur et à mesure que les tables existent
   (message, avis, favori, demande, litige, vue_profil, recherche_sans_resultat,
   session_connexion…). Tant qu'une table n'existe pas : le bloc reste marqué « fictif ».
6. **Écran « Demandes non couvertes »** (recherches sans résultat) — priorité haute
   dans la spec.
7. **Sécurité admin** : 2FA, déconnexion automatique, journal d'audit des actions.

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
