# 📖 Guide d'Utilisation Bati'Parti

Bienvenue sur **Bati'Parti**, votre application complète de gestion de chantiers de construction de maisons individuelles.

Ce guide détaille toutes les fonctionnalités disponibles pour chaque type d'utilisateur.

---

## 📑 Table des Matières

1. [Connexion et Accès](#1-connexion-et-accès)
2. [Espace Commercial](#2-espace-commercial)
   - [Tableau de Bord](#tableau-de-bord-commercial)
   - [Créer un Nouveau Dossier](#créer-un-nouveau-dossier)
   - [Gestion des Dossiers et Clients](#gestion-des-dossiers-et-clients)
3. [Espace Maître d'Œuvre (MOE)](#3-espace-maître-dœuvre-moe)
   - [Tableau de Bord](#tableau-de-bord-moe)
   - [Suivi de Chantier](#suivi-de-chantier)
4. [Espace Administrateur](#4-espace-administrateur)
   - [Gestion des Utilisateurs](#gestion-des-utilisateurs)
   - [Gestion des Modèles](#gestion-des-modèles)
   - [Supervision Globale](#supervision-globale)
5. [Fonctionnalités Transverses](#5-fonctionnalités-transverses)

---

## 1. Connexion et Accès

L'application est accessible via votre navigateur web. Pour y accéder, vous devez vous authentifier.

**Comptes de démonstration :**
- **Administrateur** : `pierre.leblanc` / `admin123`
- **Commercial** : `tristan.gervier` / `commercial123`
- **Maître d'Œuvre** : `laurent.franchet` / `maitre123`

> 🔒 **Note** : En cas d'oubli de mot de passe, veuillez contacter un administrateur.

---

## 2. Espace Commercial

Le rôle **Commercial** est dédié à la vente et à la création des projets clients.

### Tableau de Bord Commercial
Dès votre connexion, vous accédez à une vue synthétique :
- **KPIs** : Nombre de dossiers en cours, taux de conversion, chiffre d'affaires potentiel.
- **Derniers dossiers** : Accès rapide aux 5 derniers dossiers créés.
- **Raccourcis** : Bouton rapide pour "Nouveau Dossier".

### Créer un Nouveau Dossier
C'est le cœur de votre activité. Le processus se déroule en plusieurs étapes fluides :

1.  **Informations Client** :
    - Saisie des coordonnées (Nom, Prénom, Email, Téléphone).
    - **Adresse Intelligente** : Commencez à taper l'adresse, et sélectionnez la suggestion officielle (Base Adresse Nationale) pour un remplissage automatique et sans erreur.

2.  **Configuration du Projet** :
    - **Choix du Modèle** : Sélectionnez un modèle de maison (ex: "Villa T4", "Maison Plain-pied"). 
    - **Personnalisation** : Visualisez les étapes de construction incluses. Décochez les options facultatives si besoin.
    - **Planification** : Définissez une date de début souhaitée.
    - **Localisation du Chantier** : Comme pour le client, utilisez la recherche intelligente pour localiser le terrain du chantier.

3.  **Récapitulatif & Validation** :
    - Vérifiez toutes les informations saisies sur une fiche synthétique.
    - Confirmez la création pour générer le dossier.

### Gestion des Dossiers et Clients
- **Mes Dossiers** : Liste complète de vos affaires.
    - **Filtres** : Recherchez par nom de client ou ville.
    - **Export CSV** : Téléchargez la liste pour vos rapports Excel.
    - **Actions** : Voir les détails, ou supprimer un dossier (si autorisé).
- **Mes Clients** : Carnet d'adresses de vos clients avec historique de leurs projets.

---

## 3. Espace Maître d'Œuvre (MOE)

Le **Maître d'Œuvre** assure la réalisation technique et le suivi des travaux.

### Tableau de Bord MOE
Vue opérationnelle de vos chantiers :
- **Carte Interactive** : Visualisez la localisation géographique de tous vos chantiers actifs.
- **Planning** : Alertes sur les étapes en retard ou à venir prochainement.

### Suivi de Chantier
En cliquant sur un chantier, vous accédez à son pilotage complet :
- **Fiche d'identité** : Client, Adresse, Modèle choisi.
- **Timeline d'Avancement** :
    - Liste chronologique des étapes (Fondations, Murs, Toiture...).
    - **Validation** : Cochez les étapes terminées pour faire avancer la barre de progression.
    - **Gestion des Dates** : Ajustez les dates réelles de réalisation.
- **Gestion des Artisans** :
    - Affectez des artisans disponibles à chaque étape.
    - Visualisez leurs coordonnées pour les contacter rapidement.

---

## 4. Espace Administrateur

L'**Administrateur** a les pleins pouvoirs pour configurer l'application.

### Gestion des Utilisateurs
- **Annuaire** : Liste de tous les comptes (Commerciaux, MOE, Admins).
- **Actions** :
    - Créer un nouvel utilisateur avec un rôle spécifique.
    - Modifier les informations personnelles.
    - **Supprimer** : Avec sécurité (confirmation requise et blocage si l'utilisateur a des chantiers actifs).

### Gestion des Modèles
Définissez le catalogue des maisons vendues :
- **Création/Édition** : Nom, Prix de base, Description.
- **Étapes** : Associez les étapes techniques nécessaires (ex: "Terrassement", "Électricité") à chaque modèle. L'ordre des étapes est géré automatiquement.

### Supervision Globale
- **Tous les Chantiers** : Vue d'ensemble de l'activité de l'entreprise.
- **Assignation** : Possibilité de réassigner un chantier à un autre Maître d'Œuvre si besoin.
- **Suppression** : En tant qu'admin, vous pouvez supprimer définitivement tout dossier ou chantier erroné.

---

## 5. Fonctionnalités Transverses

Ces outils sont disponibles pour tous les utilisateurs :
- **Profil** : Modifiez vos informations personnelles via l'icône utilisateur en haut à droite.
- **Déconnexion** : Sécurisée, elle redirige vers la page de login.
- **Notifications** : Des messages (Toasts) apparaissent en bas de l'écran pour confirmer vos actions (ex: "Sauvegarde réussie", "Erreur de connexion").
- **Design Responsive** : L'application est utilisable sur Ordinateur, Tablette et Mobile.

---
*© 2026 Bati'Parti - Projet SAE 03*
