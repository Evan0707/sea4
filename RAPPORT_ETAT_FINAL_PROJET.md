# Rapport sur l'etat final du projet

## 3.1 L'etat final du projet

Ce document presente l'etat final du projet Bati'Parti a la date de cloture. Il synthétise ce qui a ete realise, ce qui reste inacheve, ainsi que les solutions envisagees pour finaliser et stabiliser l'application.

Le projet prend la forme d'une application web de gestion de chantiers de maisons individuelles. Il repose sur une architecture separee en deux parties :

- un backend en PHP avec Symfony ;
- un frontend en React avec TypeScript et Vite.

L'application couvre les besoins metier principaux lies a la gestion des clients, des dossiers, des chantiers, des utilisateurs et du suivi des travaux.

## 3.1.1 Une application fonctionnelle

Dans son etat final, le projet peut etre considere comme fonctionnel sur le plan metier. Les principaux parcours utilisateurs ont ete implementes et l'application presente une structure coherente, exploitable et suffisamment aboutie pour demonstrer le travail realise.

### Architecture generale

Le projet est organise de maniere claire en deux modules distincts :

- le dossier `back/`, qui contient l'API Symfony, les entites, les controleurs, les repositories, les fixtures et les tests backend ;
- le dossier `front/`, qui contient l'interface React, les pages, les composants reutilisables, la gestion des contextes applicatifs et les types TypeScript.

Cette separation permet de distinguer clairement la logique metier, l'acces aux donnees et l'interface utilisateur.

### Technologies mises en oeuvre

Les technologies principales du projet sont les suivantes :

- Backend : PHP 8.2+, Symfony, Doctrine, JWT, PostgreSQL ;
- Frontend : React 19, TypeScript, Vite, React Router, React Query, Tailwind CSS, Zod, React Hook Form ;
- Outils complementaires : ESLint, PHPUnit, Docker Compose pour la partie backend.

Le choix de ces technologies est pertinent pour une application web moderne avec une API securisee et une interface reactive.

### Fonctionnalites realisees

Les fonctionnalites principales presentes dans le depot montrent que l'application repond au besoin initial de gestion de chantiers.

#### Authentification et securite

L'application integre un systeme d'authentification base sur JWT. Les utilisateurs se connectent via une page dediee et accedent ensuite aux ecrans correspondant a leur role. Les routes protegees et la separation des profils sont presentes dans le frontend comme dans le backend.

#### Gestion par roles

Trois profils principaux sont pris en charge :

- administrateur ;
- commercial ;
- maitre d'oeuvre.

Chaque role dispose de pages, de droits et d'usages adaptes. Cette separation constitue un point fort du projet car elle reproduit une organisation proche d'une vraie application metier.

#### Fonctionnalites cote commercial

Le commercial peut notamment :

- creer un nouveau dossier client ;
- renseigner les informations client et chantier ;
- choisir un modele ;
- consulter et modifier ses dossiers ;
- suivre l'etat des dossiers en cours.

Le formulaire de creation de dossier est structure en plusieurs etapes, ce qui rend son usage plus clair et plus progressif.

#### Fonctionnalites cote maitre d'oeuvre

Le maitre d'oeuvre peut notamment :

- consulter les projets et chantiers qui lui sont affectes ;
- completer les dossiers ;
- suivre l'avancement des etapes ;
- demarrer et terminer des etapes ;
- emettre ou suivre certains elements financiers ;
- consulter une carte des chantiers ;
- affecter ou consulter les artisans selon les ecrans disponibles.

Le suivi des etapes de chantier constitue un element central du projet et reflète bien le besoin metier vise.

#### Fonctionnalites cote administrateur

L'administrateur dispose d'une vision globale et peut notamment :

- gerer les utilisateurs ;
- gerer les artisans ;
- gerer les modeles ;
- consulter la liste complete des dossiers et des chantiers ;
- acceder a des tableaux de bord et a des vues de synthese.

Cette couche d'administration rend l'application complete sur le plan organisationnel.

#### Tableaux de bord et ergonomie

Le frontend contient plusieurs tableaux de bord distincts pour les differents roles. On observe egalement :

- une navigation laterale structuree ;
- des composants reutilisables pour les formulaires et les listes ;
- des popups de confirmation ;
- des notifications utilisateur ;
- des composants de statut ;
- une recherche d'adresse assistee ;
- des vues plus visuelles comme la carte des chantiers ou les graphiques.

L'ensemble donne une interface globalement moderne et adaptee a une demonstration de fin de projet.

### Qualites globales du projet

Le projet presente plusieurs points positifs importants :

- une architecture claire ;
- une bonne separation des responsabilites ;
- une couverture fonctionnelle large ;
- une prise en compte des roles metier ;
- une documentation initiale deja presente dans le depot ;
- une base de code suffisamment riche pour servir de prototype avance.

En conclusion, le projet aboutit bien a une application fonctionnelle dans son objectif principal : numeriser le suivi de dossiers et de chantiers selon plusieurs profils utilisateurs.

## 3.1.2 Description des points inacheves

Malgre cet etat globalement satisfaisant, plusieurs points restent inacheves ou seulement partiellement finalises.

### 1. Stabilisation technique du frontend

Le frontend a fait l'objet d'evolutions recentes importantes. Le depot montre l'ajout de nouveaux composants, de nouvelles vues d'analyse de couts, d'avatars, de graphiques et d'une refonte partielle de l'interface.

Cependant, cette phase de finition n'est pas encore totalement stabilisee. Plusieurs indices montrent que le travail est encore en cours :

- coexistence d'anciennes conventions et de nouvelles conventions de composants ;
- corrections de nommage encore inachevees, notamment entre `classname` et `className` ;
- erreurs TypeScript residuelles sur certaines pages ;
- nombreux avertissements ou erreurs ESLint dans le frontend ;
- dette technique sur certains typages encore en `any`.

Cela signifie que l'interface est tres avancee, mais qu'elle n'a pas encore ete entierement fiabilisee dans son cycle final de build et de nettoyage qualite.

### 2. Couverture de tests incomplete

La couverture de tests reste limitee.

Dans le backend, quelques fichiers de tests sont presents, ce qui montre qu'une demarche de validation a ete amorcee. En revanche, cette couverture reste reduite par rapport a la taille du projet et ne couvre pas l'ensemble des cas metier importants.

Dans le frontend, la documentation mentionne explicitement une partie tests "a venir". Cela montre que la strategie de tests frontend avait ete identifiee, mais pas encore mise en place completement.

Les consequences sont les suivantes :

- certaines regressions peuvent passer inaperçues ;
- les modifications recentes sont plus difficiles a valider automatiquement ;
- la phase finale depend davantage de tests manuels.

### 3. Finition inegale de certains ecrans

Le projet contient de nombreux ecrans et composants. La majorite est bien structuree, mais certains restent moins homogenes que d'autres.

On observe notamment :

- des pages tres abouties visuellement ;
- d'autres encore en cours d'harmonisation ;
- des comportements ou composants en transition entre une ancienne version et une version plus recente.

Ce point n'empeche pas l'application d'etre utilisable, mais montre que la finition n'est pas encore parfaite sur l'ensemble du produit.

### 4. Validation qualite non entierement terminee

Le projet comporte une logique metier riche, mais la validation finale n'est pas totalement industrialisee. En pratique, cela signifie que :

- la verification automatique complete n'est pas encore totalement verte ;
- certaines anomalies techniques de surface subsistent ;
- la phase de recette finale demanderait encore une passe de consolidation.

### 5. Documentation finale a completer

Le depot contient deja un `README.md`, un guide utilisateur et une documentation frontend. C'est un point positif. En revanche, pour une livraison totalement finalisee, il manquerait encore une documentation de synthese plus orientee fin de projet, regroupant :

- l'etat reel des fonctionnalites livrees ;
- les limitations restantes ;
- les procedures de verification ;
- les choix techniques principaux ;
- les perspectives d'evolution.

Le present rapport repond justement a ce besoin de synthese finale.

## 3.1.3 Les solutions aux points inacheves

Les points inacheves identifies ne remettent pas en cause le travail realise, mais ils definissent clairement la suite logique du projet. Les solutions ci-dessous permettent de finaliser l'application dans de bonnes conditions.

### 1. Finaliser la stabilisation du frontend

La premiere action a mener consiste a terminer la remise en coherence du frontend.

Il faut pour cela :

- uniformiser les conventions de nommage des props et composants ;
- corriger les erreurs TypeScript restantes ;
- supprimer les imports inutilises ;
- remplacer les `any` residuels par des types explicites ;
- harmoniser les composants nouvellement ajoutes avec ceux deja existants.

Cette etape permettrait d'obtenir un frontend plus robuste, plus maintenable et compatible avec un build final propre.

### 2. Mettre en place une vraie strategie de tests

Pour fiabiliser durablement le projet, il est necessaire de renforcer les tests.

#### Pour le backend

Il faudrait ajouter :

- des tests d'API sur les principales routes ;
- des tests sur les cas d'erreur ;
- des tests sur les droits par role ;
- des tests sur les scenarios metier critiques comme la creation de dossier, la mise a jour d'un chantier ou le suivi des etapes.

#### Pour le frontend

Il faudrait mettre en place les outils deja envisages dans la documentation, par exemple :

- Vitest ;
- Testing Library ;
- eventuellement MSW pour simuler les appels API.

Les tests frontend pourraient couvrir :

- les formulaires ;
- la navigation selon les roles ;
- les tableaux de bord ;
- les composants reutilisables ;
- les ecrans critiques comme la connexion ou la creation de dossier.

### 3. Organiser une phase de recette finale

Une phase de recette metier permettrait de verifier l'application en conditions quasi reelles.

Cette recette devrait suivre les parcours principaux :

- connexion selon chaque role ;
- creation d'un client et d'un dossier ;
- affectation et suivi d'un chantier ;
- gestion des artisans ;
- administration des utilisateurs ;
- consultation des tableaux de bord.

L'objectif est de transformer un produit deja fonctionnel en produit fiabilise et presentable dans une logique de livraison finale.

### 4. Consolider la documentation technique et utilisateur

Une documentation finale complete devrait comprendre :

- les prerequis d'installation ;
- les commandes de lancement ;
- la structure du projet ;
- les roles utilisateurs ;
- les fonctionnalites disponibles ;
- les limites connues ;
- les pistes d'evolution.

Cette documentation faciliterait la reprise du projet par une autre equipe ou sa poursuite dans un cadre ulterieur.

### 5. Prioriser les corrections selon leur impact

Pour terminer efficacement le projet, il est pertinent de classer les travaux restants par priorite.

#### Priorite haute

- remettre le frontend dans un etat de compilation stable ;
- corriger les erreurs de typage bloquantes ;
- verifier les parcours principaux.

#### Priorite moyenne

- traiter les erreurs et avertissements de lint ;
- etendre les tests backend ;
- mettre en place les tests frontend.

#### Priorite basse

- perfectionner l'homogeneite visuelle ;
- enrichir la documentation ;
- ajouter des optimisations de confort ou de presentation.

## Conclusion

Le projet Bati'Parti aboutit a une application web serieuse, riche fonctionnellement et pertinente par rapport au besoin initial. Les fonctionnalites metier principales sont presentes, l'architecture est propre et la separation des roles utilisateurs est bien prise en compte.

L'etat final du projet peut donc etre qualifie de satisfaisant : l'application est fonctionnelle, demonstrable et deja exploitable comme prototype avance.

Les points inacheves concernent surtout la phase de consolidation finale : stabilisation du frontend, amelioration de la qualite statique, extension des tests et harmonisation complete de certains ecrans. Ces limites restent classiques pour une fin de projet et ne remettent pas en cause la valeur du travail produit.

En resume, le projet n'est pas seulement une maquette : il constitue une base applicative reelle, bien engagee, qu'une courte phase supplementaire de fiabilisation permettrait de transformer en version pleinement finalisee.