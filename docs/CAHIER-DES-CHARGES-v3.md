# LOOHOO — Cahier des charges v3 (référence projet)

> **Origine** : `loohoo-fiche-technique-v3.pdf`, reçu le 09/10/2026 — « Document de
> référence pour le développeur — évolutions à intégrer ».
> Il ne redétaille **pas** ce qui est inchangé (schéma de base, contrat API de base) :
> il liste uniquement les **ajouts et modifications**.
>
> Les 4 maquettes d'écrans correspondantes sont dans `docs/maquettes/`.
> L'état d'avancement et les prochaines étapes sont dans `docs/PLAN-DE-TRAVAIL.md`.

---

## ⚠️ Point urgent à corriger — modèle de facturation

La version en développement affiche un champ **« Commission à facturer (F CFA) »**.
**C'est faux.** LOOHOO Fournisseurs ne prend **pas de commission** : le modèle est un
**abonnement** (gratuit jusqu'à un seuil de ventes réalisées, puis mensuel).

Le champ côté admin doit devenir **« Revenu LOOHOO (abonnements actifs) »**.
À clarifier rapidement avec le développeur pour ne pas construire la mauvaise logique.

---

## Les 17 évolutions

### 1. Messagerie interne — remplace la redirection WhatsApp

La mise en relation ne redirige **plus** vers WhatsApp : l'échange acheteur ↔ fournisseur
se fait **entièrement sur la plateforme**, dès le premier contact. Objectif : LOOHOO reste
garant de l'échange, garde un historique traçable, garde les utilisateurs dans
l'écosystème. Portée V1 : **texte simple** lié à une `mise_en_relation` (pas d'appel, pas
de fichier). Les numéros réels des deux parties **restent masqués** dans la messagerie.

Table `message` : `id`, `mise_en_relation_id`, `expediteur_type` (acheteur|fournisseur),
`expediteur_id`, `contenu`, `date_envoi`, `lu`.

Comportement : une mise en relation = un fil ; les deux parties notifiées à chaque
message ; **modération a posteriori** possible (conversations consultables par l'équipe).

### 2. Badges de confiance et ancienneté (inspiré Alibaba)

Signaux de confiance sur chaque fiche fournisseur, sans intervention manuelle :
badge « Fournisseur vérifié » (`badge_verifie`, déjà prévu), drapeau du pays
(`pays`, déjà prévu), et **ancienneté calculée à l'affichage** depuis `date_inscription`
(jours si < 1 mois, mois si < 1 an, années au-delà). **Aucune table, aucun job** :
c'est un calcul d'affichage, pas une donnée stockée.

### 3. Suivi des résultats par fournisseur

Table `vue_profil` : `id`, `grossiste_id`, `date_vue`, `source` (optionnelle).
Avec `mise_en_relation` (déjà existante), permet un chiffre par fournisseur :
**vues + mises en relation sur 7 jours glissants** (au départ, requête manuelle hebdo).

### 4. Statut spécial / priorité d'affichage

Sur `grossiste` : `statut_special` (aucun | fondateur | prioritaire) et
`statut_special_expiration` (date optionnelle). Un statut actif non expiré
**remonte en tête du tri** des résultats de recherche, avant le tri habituel.
Badge sur la fiche, modifiable en administration.

### 5. Formulaire d'inscription fournisseur allégé

Soumission initiale limitée à **5 champs** : nom de l'entreprise, téléphone, ville,
catégorie de produits, stock disponible (ou en cours de constitution). Le reste
(description, photos, détails produits, case fabricant, email) est complété **après
validation**, avant publication finale.

Statuts de profil visibles en admin : **brouillon, en attente de complément, vérifié, publié**.

### 6. Modèle d'abonnement — gratuit jusqu'à un seuil de ventes

Le fournisseur reste **gratuit** jusqu'à un seuil de ventes réalisées via la plateforme
(**≈ 20 à 50 pièces**, seuil exact à affiner avec l'équipe). Au-delà : abonnement
**mensuel payant**, qui donne accès aux avantages de priorité (point 4).

Sur `grossiste` : `ventes_cumulees` (incrément manuel tant qu'il n'y a pas de
confirmation de vente automatisée), `abonnement_actif`, `date_debut_abonnement`.

**Anti-contournement** : un fournisseur pourrait recréer un compte pour repartir à zéro.
La vérification d'identité (téléphone, documents administratifs, adresse du stock) sert
de **clé de déduplication** à la validation — l'équipe doit repérer si un profil soumis
correspond à une identité déjà en base, même sous un autre nom/email.

### 7. Structure multilingue (à prévoir, pas forcément à activer)

Aucun texte d'interface **codé en dur** : passer par un système de traduction
(français par défaut, anglais en option), pour pouvoir basculer plus tard
« Fournisseurs » → « **Sourcing** » et le reste de l'interface **sans reconstruction
du site**, en vue de l'expansion anglophone.

### 8. Compte fournisseur en libre-service

Permettre à tout fournisseur — y compris loin de la Côte d'Ivoire (Bénin, Togo, Guinée)
où aucun agent terrain n'est présent — de gérer seul son profil, sans dépendre d'un
commercial. Couvre aussi les profils saisonniers (planteurs de cacao/café).

**Connexion** : numéro de téléphone + **code reçu par SMS (OTP)**.

En autonomie complète : ajout de produits, modification des descriptions, ajout de photos,
gestion du stock. **Restent verrouillés** (équipe LOOHOO uniquement) : badge « vérifié »,
drapeau du pays (validé après preuve de localisation réelle), ancienneté (calcul auto),
identité du compte (téléphone de la vérification initiale).

**Vérification à distance** : le fournisseur soumet lui-même documents administratifs et
photos de son stock/local ; l'équipe valide à distance et accorde le badge, **sans visite
physique** (sauf agent déjà sur place, cas de la Côte d'Ivoire au démarrage).

**Accompagnement commercial à la 1re inscription : phase test uniquement.** Ensuite,
inscription et prise en main en autonomie complète.

Sur `grossiste` : `date_derniere_maj_stock`. Sur `produit` : `niveau_stock`
(si la gestion de stock est au niveau produit plutôt que global).

Comportement : chaque **vente confirmée** décrémente `niveau_stock` automatiquement ;
le fournisseur peut **remonter son stock** à tout moment (nouvelle entrée), sans
validation préalable.

**Fiabilité contrôlée a posteriori** : vue admin des mouvements inhabituels (grosse
remontée juste après une grosse vente, stock inchangé malgré des ventes…) → le
call center relance ponctuellement par téléphone. **Jamais de blocage en amont.**

**Le badge « vérifié » est au niveau du profil, jamais produit par produit** : tout
produit ajouté après validation hérite du badge, sans nouvelle étape. Pas de champ
`verifie` sur `produit`.

### 9. Score de complétude du profil (inspiré IndiaMART)

Champ **calculé, non stocké** : part des champs renseignés (profil + catalogue) sur un
total attendu, affiché en **%** sur l'espace fournisseur, pour l'inciter à compléter.

### 10. Temps de réponse moyen (inspiré IndiaMART)

Afficher au fournisseur son **temps de réponse moyen** aux messages reçus (messagerie
interne), pour l'inciter à répondre vite → meilleure conversion. Calculé depuis les
horodatages de `message` (délai entre message acheteur et 1re réponse fournisseur),
moyenné sur une période glissante (ex. 7 j).

### 11. Lien de profil partageable = lien de parrainage fournisseur

Chaque fournisseur a un **slug unique** (`loohoo.com/f/kone-textiles`) + bouton
« copier le lien » → il le partage sur WhatsApp/Facebook : canal d'acquisition gratuit.
Ce même lien est le **lien de parrainage fournisseur → fournisseur**
(`parraine_par_id` sur `grossiste`).

**Mécanique de bonus** : chaque filleul augmente le seuil de ventes gratuites du parrain
de **+10**, une fois que ce filleul atteint lui-même **≈ 10 ventes réelles** (pas à la
simple vérification). **Plafond : 5 parrainages** comptabilisés (seuil max 100 ventes)
pour protéger le revenu à long terme.

**Notification « surprise »** : la règle n'est pas annoncée à l'avance ; quand le filleul
atteint le seuil, le parrain reçoit un message **ton récompense** :
« Le fournisseur que vous avez parrainé a réalisé 10 ventes. Votre score vient d'augmenter
gratuitement ! »

**Garde-fou anti-abus** : le bonus ne se déclenche qu'à un **seuil de ventes réelles**
du filleul — jamais à l'inscription ni à la vérification seule.

### 12. Notation par étoiles — réciproque (inspiré Alibaba)

Après une mise en relation : l'acheteur note le fournisseur **ET** le fournisseur note
l'acheteur (1 à 5 étoiles). Les deux moyennes s'affichent sur les profils respectifs.
Côté acheteur, la note est présentée comme un indicateur de **« fiabilité »**, pas de
« taux d'achat » — pour ne pas décourager la comparaison normale entre fournisseurs.

Table `avis` : `id`, `mise_en_relation_id`, `sens` (acheteur_vers_fournisseur |
fournisseur_vers_acheteur), `auteur_id`/`auteur_type`, `cible_id`/`cible_type`,
`note` (1-5), `commentaire` (optionnel), `date_avis`.

Affichage : « 4.6 sur 23 avis » (fournisseur) / « 4.8 sur 15 avis fournisseurs »
(acheteur), détail consultable. **Un seul avis par mise en relation et par sens.**

### 13. Espace acheteur (acheteur en gros) connecté

- **En-tête profil** : avatar, nom, pays/ville, ancienneté, badge « Acheteur LOOHOO »,
  note moyenne reçue des fournisseurs (point 12).
- **Messagerie** : conversations avec les fournisseurs contactés (même table `message`,
  filtrée par `acheteur_id`).
- **Historique de contacts** : via `mise_en_relation`.
- **Fournisseurs favoris/suivis** : table `favori` (acheteur_id, grossiste_id, date_ajout).
- **Lien de parrainage acheteur** : paliers, statut **ambassadeur** à la performance,
  accès prioritaire à l'info nouveaux fournisseurs ; bouton « copier mon lien », slug
  unique ; bonus pour le parrain à chaque filleul actif (mécanique à préciser).
- **Mes avis laissés** : via `avis` filtrée par `acheteur_id`.
- **Alerte « nouveau fournisseur dans votre catégorie »** : quand un nouveau fournisseur
  vérifié est publié dans une catégorie déjà recherchée/contactée.
- **Statistiques** (haut de l'espace) : fournisseurs contactés, montant total d'achats
  via LOOHOO (FCFA), nombre de favoris, nombre de RFQ publiées.
- **Teaser « Créez votre boutique en ligne »** : bloc permanent annonçant la future
  brique ; le bouton collecte seulement l'intérêt (« Être prévenu en premier ») ;
  le niveau de parrainage donnera droit à un avantage à l'ouverture (montant à définir).

**Demande de devis (RFQ)** — inspiré Alibaba : l'acheteur publie une demande précise
(produit, quantité, besoin) → transmise aux **fournisseurs vérifiés de la catégorie**,
qui répondent via la messagerie interne. Inverser le rapport de recherche est
particulièrement utile tant que la densité de fournisseurs est faible.

Table `demande` : `id`, `acheteur_id`, `categorie`, `description`, `date_publication`,
`statut` (ouverte | close). Une réponse de fournisseur ouvre une conversation rattachée
à la demande.

### 14. Calculateur de marge (outil autonome)

L'acheteur saisit prix d'achat unitaire + dépenses additionnelles (ajoutées une à une :
transport, emballage…) + marge visée (% ou montant fixe) → **prix de vente conseillé**.
Pur calcul côté client, **aucune donnée serveur nécessaire** en V1 (historique
éventuellement plus tard).

### 15. Analyseur de campagnes publicitaires (version gratuite)

Outil séparé (bouton dédié, pas dans le tableau de bord principal) : l'acheteur saisit
CPC, CTR, budget dépensé → recommandation **garder / couper / ajuster**.
**V1 = règles à seuils, pas d'IA** (ex. CPC au-dessus d'un seuil + CTR en dessous →
couper). Préfigure la future brique « publicité ». Pas de sauvegarde en V1
(table `analyse_campagne` si historique souhaité plus tard).

### 15bis. Notification de promotion ciblée aux acheteurs précédents

Le fournisseur active une « promotion » sur un produit. La promo est **publique**
(badge sur la fiche, section « Promotions en cours » pour tous) ; ce qui est exclusif,
c'est la **rapidité de l'information** : les acheteurs ayant déjà acheté chez lui
reçoivent une **notification prioritaire** dès l'activation, distincte de l'alerte
retour en stock (point 16).

Sur `produit` (ou table liée) : `en_promotion` (booléen), `date_activation_promo`.
Côté fournisseur : bouton « Activer la promo » sur chaque produit dans la gestion de stock.

### 16. Éléments d'engagement quotidien côté acheteur

- **Rappel de réapprovisionnement** : à partir de l'historique d'achats
  (`mise_en_relation` + confirmation de vente), estimer une fréquence par produit et
  notifier quand une nouvelle commande est probablement nécessaire.
- **Tendances de la semaine** : produits les plus recherchés/contactés
  (agrégation `vue_profil` + `mise_en_relation`), en mini-cartes.
- **Économies réalisées** : champ cumulatif comparant le prix payé via LOOHOO à un prix
  de référence marché (**méthode à définir** avec l'équipe ; peut rester approximatif).
- **Alerte de retour en stock** : si un fournisseur favori/contacté était en rupture,
  notifier dès que son stock repasse au-dessus de zéro.

### 17. Interface d'administration — rôles et modules

**Deux écrans à ne surtout pas confondre :**
- **« Général »** (onglet par défaut) = le vrai tableau de bord super-admin :
  CA LOOHOO (revenu + GMV), santé du réseau, litiges et parrainages (**chiffres agrégés
  uniquement**), **demandes non couvertes**, équipe, feuille de route. Écran d'accueil.
- **« Fournisseurs »** (sous-module admin) = module opérationnel : fournisseurs publiés,
  produits, acheteurs, à traiter (file de vérification, litiges, coordonnées détectées),
  aperçu rapide. **Ce n'est pas** l'espace où le fournisseur se connecte lui-même.
  « Demandes non couvertes » reste dans « Général », pas ici.
- **« Boutiques »** : onglet **verrouillé**, réservé à la future brique.

**Rôles (RBAC dès le départ, 2 actifs au lancement) :**
- **Super-admin** (Rodrigue Guedeu) : accès total — configuration, zones, seuils,
  statistiques globales, feuille de route.
- **Modérateur/Validateur** (Anno) : file de vérification, badge vérifié, supervision
  terrain, alertes stock.
- Prévus (structure de permissions déjà posée) : **Agent support/call center** (alertes
  + historique, pas de droit de modification), **Commercial terrain** (tableau de
  recrutement, création de profils **en brouillon uniquement**, géré par le modérateur),
  **Gestionnaire de litiges**, **Finance/Comptabilité** (abonnements encaissés,
  Mobile Money, remboursements, primes) — surtout à partir de la Phase 2.

**File d'action à l'échelle** : file **filtrable et cherchable** (En attente / Litiges /
Approuvés, recherche nom/pays) plutôt qu'une liste plate ; **actions groupées** (sélection
multiple, approbation/rejet en lot avec confirmation du nombre d'éléments) ;
**actions critiques utilisables sur mobile** (validation, rejet, suspension).

**Gestion des litiges** : déclenchement **manuel** (bouton « Signaler un problème » dans
la messagerie) ou **automatique** (note 1-2★ + commentaire). Table `litige` : `id`,
`mise_en_relation_id`, `type` (paiement | délai-stock | autre), `origine`
(signalement | auto), `description`, `statut` (ouvert | en cours | résolu), `assigné_a`,
`date_ouverture`, `date_resolution`, `resolution_notes`. Traitement **dossier par dossier**
réservé au gestionnaire de litiges ; la vue super-admin n'affiche que des **agrégés**
(en attente, en cours, résolus 7 j, par type).

**Statistiques de parrainage** : onglet « Parrainages » dans la courbe de tendance
admin (filleuls actifs, séparés acheteur↔acheteur et fournisseur↔fournisseur) +
bloc de comptage dédié par programme (en attente de 1re action / validés / actifs).

**Paiement intégré = Phase 2** de LOOHOO Fournisseurs (pas une brique séparée) :
agrégateur **Mobile Money** d'Afrique de l'Ouest (**CinetPay, PayDunya**…) plutôt qu'une
intégration par opérateur — 2 à 3,5 % par transaction, couverture multi-pays.
Renforce les litiges (preuve de transaction) et la fiabilité des stats de ventes.

**Interface modérateur (Anno)** — distincte du super-admin : file d'attente détaillée
avec recherche ; dossier affichant les pièces soumises (documents, photos stock/local),
les infos déclarées (pays, catégorie, statut stock, commercial recruteur) ; ses propres
stats de la semaine (validés / rejetés / délai moyen) ; signal visuel au-delà de **48 h**.
+ **Motif obligatoire au rejet** (enregistré, visible si resoumission) · **signal de
resoumission** (comparaison par identité : téléphone/documents) · **checklist standardisée**
(document lisible, photo cohérente avec la catégorie, local/adresse cohérent) · **lien de
contact vers le commercial recruteur** pour demander un complément avant de rejeter.

**Interface du gestionnaire de litiges** (fusionnée avec le support au lancement) :
stats (en attente, en cours, résolus 7 j) ; dossier ouvert avec **les deux parties face à
face** (nom, note étoiles, litiges antérieurs — repérer un récidiviste) ; aperçu de la
conversation + lien vers le fil ; preuves jointes ; classification par type ;
**note de résolution obligatoire** ; « marquer résolu » ; **escalade vers le super-admin** ;
**un droit de contestation** pour la partie non favorisée.

**Note de rôle — fusion au lancement** : « Gestionnaire de litiges » et « Agent
support/call center » = **une même personne** au démarrage, sous l'intitulé
**« Service client & litiges »**, avec un **sélecteur** en haut de page
(« ⚖️ Litiges » / « 📞 Call center ») — pas tout mélangé sur un écran. Les permissions
restent **définies séparément** dans le RBAC, pour scinder en deux personnes plus tard
sans redéveloppement.

**Interface du commercial terrain** : objectif hebdo visible (barre de progression), taux
de validation de ses soumissions, **primes dues ce mois** (fournisseurs validés ×
montant), bouton « Ajouter un fournisseur » (formulaire allégé → **brouillon**, aucun
droit de validation), liste de ses soumissions avec statut (en attente / validé / rejeté
**avec motif**).

**Suspension d'un fournisseur déjà vérifié** : le modérateur peut rechercher un
fournisseur publié et **suspendre son badge** (litige grave, signalements répétés).
Champ `statut` sur `grossiste` (actif | suspendu), **motif obligatoire**, journalisé dans
le journal d'audit.

**Gestion des commerciaux terrain par le modérateur** : il peut ajouter/retirer des
comptes « commercial terrain » **uniquement** — jamais s'attribuer un rôle supérieur
(réservé au super-admin). Liste avec nombre de fournisseurs intégrés.

**Détection de coordonnées exposées** (déjà en développement — **à conserver**) :
scan automatique des descriptions de produits et des messages pour repérer un
téléphone/contact en clair (contournement du masquage). Indicateurs admin : nombre de
produits et de fournisseurs avec coordonnées détectées.

**Modules admin à construire** : suivi de connexion de l'équipe (statut en direct
« point vert » + historique des sessions — table `session_connexion` (membre_id,
date_debut, date_fin) ; fin déduite d'une inactivité prolongée) · **Gestion de l'équipe
et des rôles** (super-admin only : liste avec rôle, « Ajouter un membre », édition/retrait
— c'est l'écran qui rend le RBAC réellement utilisable) · **CA LOOHOO** (GMV **et**
revenu réel côte à côte) · **courbe à onglets** (Revenu / GMV / nouveaux fournisseurs /
nouveaux acheteurs — Revenu par défaut) · **indicateurs de santé du réseau**
(rétention 30 j, délai avant 1re vente, **concentration du GMV** — part des 10 plus gros
fournisseurs) · **résolution de litiges** (consulter le fil, trancher, historiser dans les
deux parties) · **journal d'audit** (chaque action admin tracée : auteur + horodatage) ·
**santé globale** (fournisseurs actifs, acheteurs actifs, mises en relation, répartition
par pays/catégorie) · **sécurité** (2FA obligatoire, déconnexion auto après inactivité) ·
**journal des décisions stratégiques** (super-admin only : décisions datées = mémoire de
l'entreprise) · plus tard : détection d'anomalies automatisée, plans d'abonnement
configurables sans redéploiement, export/API analytics.

**Tableau de bord Super-admin — courbe à onglets** : le dashboard « Général » reprend le
modèle de courbe à onglets déjà utilisé côté fournisseur, avec **4 vues : Revenu, GMV,
Fournisseurs actifs, Acheteurs actifs** ; placé juste après le bloc revenu (hero), avant
« Santé du réseau ». Le sous-module admin « Fournisseurs » reprend la même courbe adaptée
à son périmètre : **Fournisseurs publiés, Produits, Acheteurs, Demandes (7 j)**.

**Statut Ambassadeur ≠ rôle Responsable de zone** :
- **Ambassadeur** (parrainage performant) reste un **acheteur**, pas un rôle admin.
  Pas d'interface séparée : un **mode** dans son espace acheteur, via un bouton
  « Passer en mode Ambassadeur » qui apparaît une fois le palier franchi. Donne : accès
  prioritaire aux nouveaux fournisseurs de sa zone, vue de son réseau de filleuls, canal
  pour signaler/influencer une décision locale. **Aucun droit d'administration.**
- **Responsable de zone / modérateur-pays** : **droits d'admin réels** (vérifier, valider,
  suspendre), accordés par le super-admin — **jamais débloqués automatiquement** par la
  performance de parrainage (vérifier des documents ≠ recruter des filleuls).
- **Passerelle humaine** : le meilleur ambassadeur d'un pays est un **candidat
  pré-qualifié**, mais c'est le super-admin qui décide.
- **Implication technique** : le rôle « modérateur » doit être conçu avec un **champ
  zone/pays dès le départ** (même si tout est Côte d'Ivoire aujourd'hui), plutôt que de
  dupliquer une maquette par pays. Idem pour le **commercial terrain**.

**Rapport de journée auto-remonté** (modérateur + service client & litiges + commercial
terrain) : chacun voit dans son espace une carte **« Votre journée »** (volume du jour,
comparaison avec la veille, cumul de la semaine) + bouton **« Valider ma journée »** qui
remonte automatiquement, horodaté et sans ressaisie, dans « Votre équipe » du tableau de
bord Général du super-admin.

**Feuille de route visible** : vue super-admin = feuille complète (futures briques, date
cible, **barre de progression basée sur un indicateur réel** — ex. nombre de fournisseurs
vérifiés — plutôt qu'une date figée seule). Vue des autres rôles = **bannière discrète
en bas de leur écran**, en lecture seule, sans action
(ex. « Prochaine étape LOOHOO : Boutique en ligne — 2027 »).

### 17bis. Suivi des recherches sans résultat — **priorité haute**

Journaliser chaque recherche **sans résultat** et chaque RFQ **restée sans réponse** :
c'est le signal le plus direct pour orienter le recrutement terrain (quelle catégorie,
quelle ville manque), bien plus fiable qu'une logique d'expansion générale.

Table `recherche_sans_resultat` : `id`, `terme_recherche`, `categorie` (si détectable),
`ville`/`pays` de l'acheteur, `date`. Alimentée automatiquement à chaque recherche à zéro
résultat.

Écran super-admin **« Demandes non couvertes »** : termes/catégories les plus recherchés
sans résultat sur 7/30 jours, triés par fréquence, avec ville/pays d'origine.

---

## Décisions restant à trancher avec l'équipe

- Seuil d'abonnement exact (**≈ 20-50 ventes** ?).
- Paliers exacts de parrainage (**+10 ventes par filleul, max 5**).
- Solution **SMS/OTP** retenue pour l'authentification fournisseur.
- Agrégateur **Mobile Money** (CinetPay / PayDunya…).
- Méthode du **« prix de référence »** des économies affichées.
- Montant de l'avantage **« boutique en ligne »** promis aux meilleurs parrains.
- Délais internes (ex. **48 h** sur un dossier en attente).
- Mécanique de bonus du **parrainage acheteur**.

## Règles à ne pas enfreindre en codant

1. **Jamais de commission** : le modèle est un abonnement.
2. **Jamais de chiffre d'exemple codé en dur** (voir l'avertissement dans les maquettes).
3. **Numéros de téléphone masqués** dans la messagerie.
4. **Badge « vérifié » au niveau du profil**, jamais produit par produit.
5. **Aucun texte d'interface en dur** : prévoir la traduction (fr par défaut, en plus tard).
6. **Pas de blocage en amont** sur le stock : contrôle a posteriori.
7. Le rôle **modérateur** doit porter un **champ zone/pays** dès la conception.
