# Bati'Parti - Application de Gestion de Chantiers

Application web de gestion de chantiers permettant aux commerciaux, maîtres d'œuvre et administrateurs de gérer les projets de construction.

## Technologies utilisées

### Backend
- PHP 8.2
- Symfony 6
- JWT pour l'authentification
- PostgreSQL pour la base de données

### Frontend
- React avec TypeScript
- Vite comme bundler
- TailwindCSS pour le style
- JWT pour la gestion des tokens d'authentification

## Installation

### Prérequis
- PHP 8.2 ou supérieur
- Composer
- Node.js 18 ou supérieur
- PostgreSQL
- Symfony CLI (recommandé)

### Backend (Symfony)

```bash
cd back
composer install

# Configuration de la base de données PostgreSQL sur gigondas
# Créez un fichier .env et ajoutez-y vos informations de connexion :
DATABASE_URL="postgresql://votre_login:votre_password@gigondas:5432/geryev?serverVersion=17&charset=utf8&options='--search_path=bati'"
```

### Frontend (React)

```bash
cd front
npm install
npm run dev
```

## Comptes par défaut

Les fixtures créent automatiquement trois utilisateurs de test :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@example.com | admin123 | Administrateur |
| commercial@example.com | commercial123 | Commercial |
| maitre_oeuvre@example.com | maitre123 | Maître d'œuvre |

## Structure du projet

### Backend

```
back/
├── src/
│   ├── Controller/     # Points d'entrée de l'API
│   ├── Entity/         # Entités Doctrine
│   ├── Repository/     # Requêtes base de données
│   └── DataFixtures/   # Données de test
└── config/
    └── packages/       # Configuration (sécurité, JWT, etc.)
```

### Frontend

```
front/
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── pages/         # Pages de l'application
│   ├── context/       # Contextes React (auth, etc.)
│   └── types/         # Types TypeScript
```

## Fonctionnalités principales

### Administrateur
- Gestion des utilisateurs (création, modification, suppression)
- Vue d'ensemble de tous les dossiers et projets
- Gestion des artisans

### Commercial
- Création de nouveaux dossiers clients
- Suivi des dossiers en cours
- Interface de création de devis

### Maître d'œuvre
- Suivi des projets assignés
- Gestion des étapes de chantier
- Suivi des interventions artisans

## API Endpoints

### Authentification
- POST `/api/login_check` - Connexion et récupération du token JWT

### Administration
- GET `/api/admin/utilisateurs` - Liste tous les utilisateurs
- POST `/api/admin/utilisateurs` - Crée un nouvel utilisateur

### Routes protégées
Toutes les routes nécessitent un token JWT valide dans le header :
```
Authorization: Bearer <token>
```

## Configuration

### Base de données
Pour configurer l'accès à la base de données sur gigondas :
1. Créez un fichier `.env` si il n'y en a pas dans le dossier `back/`
2. Ajoutez-y la variable DATABASE_URL si il n'y en a pas avec vos informations de connexion :
```
DATABASE_URL="postgresql://votre_login:votre_password@gigondas:5432/geryev?serverVersion=17&charset=utf8&options='--search_path=bati'"
```
3. Remplacez votre_login et votre_password par vos identifiants gigondas
4. Le schéma 'bati' sera automatiquement utilisé grâce à l'option search_path dans la BD geryev
5. Les tables sont déjà créées dans le schéma 'bati', aucune migration n'est nécessaire

### JWT
Les clés JWT sont déjà incluses dans le projet (`back/config/jwt/`). 
Si vous devez les regénérer, utilisez la commande :
```bash
cd back
php bin/console lexik:jwt:generate-keypair
```

### CORS
La configuration CORS se trouve dans `config/packages/nelmio_cors.yaml` :
```yaml
nelmio_cors:
    defaults:
        allow_origin: ['http://localhost:5173']
        allow_methods: ['GET', 'POST', 'PUT', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
```

## Développement

### Lancer le backend
```bash
cd back
symfony serve
```
Le serveur démarre sur `http://localhost:8000`

### Lancer le frontend
```bash
cd front
npm run dev
```
L'application est accessible sur `http://localhost:5173`

## Déploiement

### Backend
1. Configurer le serveur web (Apache/Nginx)
2. Configurer les variables d'environnement
3. Générer les clés JWT
4. Exécuter les migrations

### Frontend
1. Construire l'application :
```bash
cd front
npm run build
```
2. Déployer le contenu du dossier `dist`
