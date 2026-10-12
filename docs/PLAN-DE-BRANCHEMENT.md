# LOOHOO Admin — plan de branchement des données réelles

> Écrit le **12/10/2026**, après accès au **code source complet** (nouvelle invitation
> GitHub). But : pour **chaque interface** de l'admin, dire **où prendre la donnée**
> (table, colonne, fonction serveur) et remplacer les blocs fictifs.
> Règle inchangée : **ce qui n'existe pas côté code reste marqué « pas connecté »** —
> on n'invente jamais une source.

## 1. Les dépôts et les bases (état vérifié le 12/10/2026)

| Dépôt | Rôle | Base de données |
|---|---|---|
| `Agnissanv/loohoo-admin` | **ce dépôt** : panneau du siège (2 espaces) | celle des fournisseurs (voir ci-dessous) |
| `Agnissanv/loohoo-fournisseurs` | annuaire fournisseurs (utilisateurs) | Supabase **`dvvoxkyfytrabcxdbsbq`** |
| `Agnissanv/SaaS_boutique_en_ligne` | moteur de boutique (usine) | une base **par boutique** |
| `Agnissanv/loohoo` | vitrine / marque | statique |

Deux façons de lire, selon la partie de l'admin :

1. **Espace Fournisseurs / Modérateur / Service client** → la base de l'annuaire
   (`VITE_SUPABASE_URL` du fichier `.env.local`), **avec la session admin**
   (c'est la session qui ouvre les tables protégées : `is_admin()`).
2. **Espace Boutiques** → il n'y a **pas** de base unique : chaque boutique a
   **son propre projet Supabase**. Le pont serveur `api/boutiques-stats.js` tient
   un **registre** (`MEDITHE_SUPABASE_URL` + `MEDITHE_SUPABASE_SERVICE_ROLE_KEY`)
   et interroge, boutique par boutique, les tables `produits` et `commandes`.
   Une boutique non enregistrée là ne peut pas remonter : c'est un ajout de
   variable d'environnement, pas un appel de plus.

## 2. Ce qui existe vraiment dans la base de l'annuaire (vérifié en lecture)

Tables lisibles publiquement : `grossiste`, `produit`, `grossiste_photo`,
`produit_photo`, `categorie`, `sous_categorie`, `pays_loohoo`.
Tables réservées à l'admin (session requise) : `admins`, `affaire`, `commission`,
`avis`, `conversation`, `message`, `message_masque`, `document_fournisseur`,
`favori`, `grossiste_contact`, `grossiste_decision`, `journal_admin`, `media`,
`note_admin`, `parametre`, `recherche_sans_resultat`, `vendeur`, `visite`.

Fonctions serveur déjà en place et utilisables par le panneau :

| Fonction | Ce qu'elle renvoie |
|---|---|
| `admin_tableau_de_bord()` | **tout le tableau de bord en un appel** : publies, suspendus, verifies, drapeaux, produits{total, en_attente, rejetes, stock_non_verifie}, documents_en_attente, messages{sept_jours, signales}, conversations{sans_reponse}, acheteurs, leads, mises_en_relation, affaires{proposees, contestees, confirmees, volume_fcfa, commission_a_facturer, commission_facturee, commission_payee, taux} |
| `stats_fournisseurs()` | grossistes_total / publies / verifies / en_attente, produits_total / en_attente, contacts_7_jours, top_categories, top_villes |
| `admin_liste_admins()` | user_id, email, role, date_ajout |
| `admin_recherches_vides(p_jours)` | terme, categorie, ville, nombre |
| `admin_vendeurs()` | la liste des acheteurs (`vendeur`) |
| `admin_decider_fournisseur(p_id, p_statut, p_motif)` | publier / suspendre un fournisseur (motif obligatoire) |
| `admin_decider_document`, `admin_marquer_message_traite` | décisions sur documents et messages signalés |
| `formules_abonnement()` | seuil + niveaux {niveau, mensuel, annuel} → sert au revenu |
| `indicateurs_confiance(p_ids)` | indicateurs par fournisseur |

**Important** : le revenu de la plateforme est un **abonnement** (pas une
commission). Il se calcule avec `grossiste.abonnement_actif` +
`grossiste.date_debut_abonnement` + `formules_abonnement()`.

## 3. Matrice de branchement, écran par écran

### 3.1 Écran « Général » (tableau de bord)

| Bloc de l'écran | Source réelle | État |
|---|---|---|
| Santé de la plateforme (KPI fournisseurs / produits) | `stats_fournisseurs()` | ✅ déjà branché |
| File d'action (publier / suspendre) | `grossiste` + `produit` via `admin.js` | ✅ déjà branché |
| Surveillance — fournisseurs suspendus | `grossiste.statut='suspendu'` | ✅ déjà branché |
| Profil connecté | session Supabase | ✅ déjà branché |
| **Chiffre d'affaires — Revenu LOOHOO** | `grossiste.abonnement_actif` × `formules_abonnement().niveaux[].mensuel` | 🆕 à brancher |
| **Chiffre d'affaires — GMV facilité** | `admin_tableau_de_bord().affaires.volume_fcfa` | 🆕 à brancher |
| **Courbe Fournisseurs / Acheteurs** | `grossiste.date_ajout`, `vendeur.date_ajout` (comptage par jour) | 🆕 à brancher |
| **Surveillance — Coordonnées détectées** | `message_masque` + `grossiste.drapeau_coordonnees` + `produit.drapeau_coordonnees` | 🆕 à brancher |
| **Surveillance — Demandes sans réponse** | `admin_tableau_de_bord().conversations.sans_reponse` | 🆕 à brancher |
| **Santé du réseau** | `visite` + `produit.stock_maj_le/verifie_le` (rétention, délai 1re vente, concentration) | 🆕 à brancher |
| **Litiges (en attente / en cours / résolus)** | `affaire.statut` (contested / proposed / confirmed) | 🆕 à brancher |
| **Alertes stock** | `produit` où `stock_verifie_le is null` | 🆕 à brancher |
| **Journal des décisions** | `journal_admin` (+ `admins` pour les initiales) | 🆕 à brancher |
| **Équipe & rôles** | `admin_liste_admins()` | 🆕 à brancher |
| **Parrainages** | — **aucune table de parrainage** dans cette base | ⛔ reste « pas connecté » |
| **Historique de connexion** | — la table `session_connexion` **n'existe pas** | ⛔ reste « pas connecté » |
| Feuille de route | contenu produit, pas une donnée | ✔️ sans objet |

### 3.2 Écran « Fournisseurs » (maquette n02)

| Bloc | Source réelle | État |
|---|---|---|
| Hero — Fournisseurs publiés / Produits publiés / Acheteurs / Demandes (7 j) | `stats_fournisseurs()` + `admin_tableau_de_bord()` | 🆕 à brancher |
| Courbe à onglets (Fournisseurs / Produits / Acheteurs / Demandes) | comptage par jour : `grossiste.date_ajout`, `produit.date_ajout`, `vendeur.date_ajout`, `conversation.date_creation` | 🆕 à brancher |
| « Fournisseurs à valider » | `grossiste.statut='en_attente'` | 🆕 à brancher |
| « Litiges en attente » | `admin_tableau_de_bord().affaires.contestees` | 🆕 à brancher |
| « Coordonnées détectées » | `message_masque` (messages filtrés) | 🆕 à brancher |
| « Revenu LOOHOO ce mois » | abonnements (voir 3.1) | 🆕 à brancher |
| « Filleuls actifs » | — pas de table de parrainage | ⛔ reste « pas connecté » |

### 3.3 Écran « File de validation » (`/fournisseurs/en-attente`)

| Bloc | Source réelle | État |
|---|---|---|
| Liste des dossiers (nom, pays, catégorie, soumis le) | `grossiste` `statut='en_attente'` : `nom`, `pays`/`ville`, `categorie`, `date_ajout` | 🆕 à brancher |
| Pièces du dossier | `document_fournisseur` + `grossiste_photo` | 🆕 à brancher |
| « Recruté par » | — la base ne stocke pas qui a recruté | ⛔ reste « pas connecté » |
| Décision valider / rejeter | `admin_decider_fournisseur(p_id, p_statut, p_motif)` | 🆕 à brancher |
| Motif de rejet | `grossiste_decision` / `grossiste.motif_rejet` | 🆕 à brancher |

### 3.4 Écran « Modérateur » (maquette n03)

| Bloc | Source réelle | État |
|---|---|---|
| « Votre journée » (aujourd'hui / hier / semaine) | `journal_admin` filtré sur `date_action` et `admin_id` | 🆕 à brancher |
| Dossier en cours (nom, pays, catégorie, stock, soumis) | `grossiste` + `document_fournisseur` | 🆕 à brancher |
| Checklist (identité, photo stock, local) | dérivée des pièces + `grossiste.pays`/`ville` | 🆕 à brancher |
| File d'attente (six à vérifier, un depuis 48 h) | `grossiste.statut='en_attente'` (+ `date_ajout` < maintenant − 48 h) | 🆕 à brancher |
| Fournisseurs publiés | `grossiste.statut='publie'` | 🆕 à brancher |
| « Commerciaux terrain actifs » | — pas de table des commerciaux | ⛔ reste « pas connecté » |
| « Contacter le commercial » | — messagerie interne inexistante | ⛔ reste « pas connecté » |

### 3.5 Écran « Service client & litiges » (maquette n04)

| Bloc | Source réelle | État |
|---|---|---|
| Dossier de litige (parties, fil, preuves) | `affaire` + `conversation` + `message` (+ `media`) | 🆕 à brancher |
| Type de litige (Paiement / Délai / Autre) | — `affaire` n'a pas de type | ⛔ reste « pas connecté » |
| File des litiges | `affaire.statut` (contestée / proposée) | 🆕 à brancher |
| « Note 1★ détectée » | `avis` où `note <= 2` | 🆕 à brancher |
| Alertes stock | `produit` où `stock_verifie_le is null` | 🆕 à brancher |
| « Relancé hier » | — aucune trace de relance | ⛔ reste « pas connecté » |

### 3.6 Écran « Boutiques »

| Bloc | Source réelle | État |
|---|---|---|
| Chiffres par boutique | pont `api/boutiques-stats.js` (registre de boutiques, tables `produits` / `commandes`) | ✅ déjà branché (une seule boutique enregistrée : MédiThé) |
| « Ouvrir son admin » | lien externe vers l'admin de la boutique | ✅ déjà branché |
| Demandes d'ouverture | `leads` de la landing (`source landing-*`) | 🆕 à brancher |
| Litiges / notes des boutiques (Koné Textiles…) | — ces noms viennent des maquettes, aucune base ne les contient | ⛔ reste « pas connecté » |

### 3.7 Écran « Demandes non couvertes » (aujourd'hui absent)

| Bloc | Source réelle | État |
|---|---|---|
| Recherches sans résultat | `recherche_sans_resultat` + `admin_recherches_vides(p_jours)` | 🆕 écran à créer, source prête |

## 4. Légende des états

- ✅ **déjà branché** : lit la base ou une fonction serveur aujourd'hui.
- 🆕 **à brancher** : la source existe (code source à l'appui) — à faire dans `src/api/`.
- ⛔ **pas connecté** : n'existe ni en base ni dans le code → le bloc garde sa
  mention explicite à l'écran. Ne jamais lui inventer un chiffre.

## 5. Vérifié sur la base en ligne le 12/10/2026 (lecture seule)

Noms de colonnes confirmés (tests de lecture sur la base de l'annuaire) :

| Table | Colonnes réellement présentes |
|---|---|
| `grossiste` | id, nom, ville, commune, pays, categorie, statut, badge_verifie, stock_confirme, date_ajout, abonnement_actif, date_debut_abonnement, drapeau_coordonnees, description, slug, logo_url, banniere_url, vues_profil |
| `produit` | id, nom, grossiste_id, prix_gros_fcfa, moq, statut, motif_rejet, actif, stock_disponible, stock_verifie_le, stock_maj_le, stock_verifie_par, date_ajout, drapeau_coordonnees |
| `vendeur` (acheteurs) | id, user_id, nom, telephone, **date_inscription** (pas `date_ajout`) |
| `admins` | user_id, role, date_ajout — **pas de colonne `email`** : l'e-mail vient de `admin_liste_admins()` |
| `conversation` | id, … **derniere_activite** (pas `date_creation`) |
| `message` | id, conversation_id, expediteur, contenu, date_envoi, lu, signale, signale_traite |
| `affaire` | id, conversation_id, grossiste_id, vendeur_id, montant_fcfa, statut, date_declaration, date_reponse, declaree_par |
| `avis` | id, grossiste_id, affaire_id, note, commentaire, statut, date_creation, date_moderation |
| `media` | id, grossiste_id, url, nom, date_ajout (rattaché au fournisseur, pas à la conversation) |
| `document_fournisseur` | id, grossiste_id, statut, type, date_ajout |

Fonctions serveur présentes et utilisables avec une session admin :
`admin_tableau_de_bord()`, `stats_fournisseurs()`, `formules_abonnement()`,
`admin_liste_admins()`, `admin_recherches_vides()`, `admin_decider_fournisseur()`,
`admin_decider_document()`, `admin_trancher_affaire()`, `is_admin()`.
`moderer_produit(p_id, p_statut, p_motif)` : c'est `admin.js` qui l'appelle — elle
n'apparaît **pas** dans les migrations du dépôt ; à confirmer côté base.

⚠️ **Écart code / base à signaler** : la migration 0006 du dépôt fournisseurs
(déplacer adresse, site web et réseaux sociaux dans la table protégée
`grossiste_contact`) **n'est pas appliquée** sur la base en ligne : ces trois
champs restent lisibles par n'importe qui avec la clé publique du site, alors que
le code les croit privés. Les numéros de téléphone, eux, sont bien protégés.

## 6. État d'avancement (12/10/2026)

- [x] `src/api/loohoo.js` — couche de lectures réelles (une fonction par écran).
- [x] Écran **Général** : CA (abonnements + affaires), santé du réseau,
      surveillance, litiges, alertes stock, journal des décisions, équipe,
      recherches sans résultat.
- [x] Écran **Fournisseurs** (n02) : hero, courbe 7 jours, « À traiter », aperçu.
- [x] Écran **File de validation** : dossiers réels + décision réelle
      (`admin_decider_fournisseur`, motif obligatoire pour rejeter).
- [x] Écran **Modérateur** (n03) : journée (journal d'audit), dossier en cours,
      file d'attente, publiés + décision réelle.
- [x] Écran **Service client** (n04) : litiges (affaires), avis 1-2★, alertes
      stock, arbitrage réel (`admin_trancher_affaire`).
- [x] `donnees-fictives.js` / `donnees-espaces.js` vidés de tout chiffre inventé :
      ils ne gardent que le contenu d'écran et les blocs « pas connecté ».
- [x] Jeu de démonstration local `src/api/loohoo-demo.js` (remplacé à la volée par
      `vite.config.js` quand `VITE_DEMO_ADMIN=1`) pour voir les écrans sans compte admin.
- [x] `npm run build` passe ; les 5 écrans s'affichent sans erreur JS.
- [ ] **À faire par un humain** : se connecter avec un vrai compte admin et vérifier
      que chaque bloc remonte bien les données de la base (les tests ci-dessus
      n'ont pas pu utiliser de session administrateur).
- [ ] Écran **Demandes non couvertes** (source prête : `recherche_sans_resultat`).
- [ ] Écran **Produits**, **Conversations**, **Acheteurs**, **Catégories**,
      **Commercial terrain** (aucune table commerciale → à décider).
- [ ] Décider du sort de `moderer_produit` (fonction absente des migrations).

