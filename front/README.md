# 🎨 Frontend Bati'Parti

Interface utilisateur React pour la gestion de dossiers et projets de construction.

---

## 📋 Table des matières

- [Technologies](#-technologies)
- [Installation](#-installation)
- [Scripts disponibles](#-scripts-disponibles)
- [Structure du projet](#-structure-du-projet)
- [Routing et navigation](#-routing-et-navigation)
- [Authentification](#-authentification)
- [Gestion d'état](#-gestion-détat)
- [Styling](#-styling)
- [Composants](#-composants)
- [Build et déploiement](#-build-et-déploiement)

---

## 🛠️ Technologies

- **React 19** - Framework UI
- **TypeScript 5.9** - Typage statique
- **Vite 7** - Build tool ultra-rapide
- **React Router 7** - Routing
- **Tailwind CSS 4** - Framework CSS utility-first
- **Zod** - Validation de schémas
- **React Hook Form** - Gestion de formulaires
- **date-fns** - Manipulation de dates
- **Myna UI Icons** - Bibliothèque d'icônes
- **JWT Decode** - Décodage de tokens JWT

---

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm/pnpm/yarn
- Backend Symfony en cours d'exécution sur `http://localhost:8000`

### Étapes

```powershell
# Cloner le projet (si pas déjà fait)
git clone <url-du-repo>
cd sae-03/front

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

---

## 📜 Scripts disponibles

```powershell
# Serveur de développement avec hot reload
npm run dev

# Build de production
npm run build

# Linter (ESLint)
npm run lint

# Preview du build de production
npm run preview
```

---

## 📁 Structure du projet

```
front/
├── public/              # Assets statiques
├── src/
│   ├── assets/         # Images, logos, fonts
│   ├── components/     # Composants réutilisables
│   │   ├── auth/       # Composants d'authentification
│   │   ├── layout/     # Sidebar, HeaderBar
│   │   └── README.md   # Documentation des composants
│   ├── context/        # Context API (Auth, Toast, Online)
│   ├── pages/          # Pages/vues de l'application
│   │   ├── auth/       # Login, Register
│   │   └── dashboard/  # Pages protégées par rôle
│   ├── styles/         # CSS personnalisé
│   ├── types/          # Types TypeScript
│   ├── config/         # Configuration (navigation...)
│   ├── App.tsx         # Composant racine + routing
│   ├── main.tsx        # Point d'entrée
│   └── index.css       # Styles globaux + Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md           # Ce fichier
```

---

## 🗺️ Routing et navigation

### Routes publiques

| Route | Description |
|-------|-------------|
| `/login` | Page de connexion |
| `/unauthorized` | Page d'accès refusé |
| `*` | Page 404 (routes inexistantes) |

### Routes Commercial (`ROLE_COMMERCIAL`)

| Route | Description |
|-------|-------------|
| `/commercial` | Dashboard commercial |
| `/commercial/dossiers` | Liste des dossiers |
| `/commercial/nouveau-dossier` | Création de dossier |

### Routes Maître d'œuvre (`ROLE_MAITRE_DOEUVRE`)

| Route | Description |
|-------|-------------|
| `/maitre-doeuvre` | Dashboard maître d'œuvre |
| `/maitre-doeuvre/dossiers` | Liste des dossiers |
| `/maitre-doeuvre/dossiers/:id` | Détails d'un dossier |
| `/maitre-doeuvre/projets` | Liste des projets |
| `/maitre-doeuvre/projets/:id` | Détails d'un projet |

### Routes Admin (`ROLE_ADMIN`)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard admin |
| `/admin/dossiers` | Gestion des dossiers |
| `/admin/projets` | Gestion des projets |
| `/admin/utilisateurs` | Gestion des utilisateurs |
| `/admin/artisans` | Gestion des artisans |

### Protection des routes

Les routes sont protégées via le composant `ProtectedRoute` qui :
- Vérifie l'authentification (présence du token JWT)
- Vérifie les rôles autorisés
- Redirige vers `/login` si non authentifié
- Redirige vers `/unauthorized` si rôle insuffisant

---

## 🔐 Authentification

### Contexte Auth

Utilise `AuthContext` pour gérer l'état d'authentification.

```tsx
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth()
  
  // user contient: { username, roles, token }
  return <div>Bonjour {user?.username}</div>
}
```

### Stockage

- Token JWT stocké dans `localStorage` sous la clé `token`
- Décodage automatique pour extraire username et roles
- Expiration gérée automatiquement

### Flow de connexion

1. Utilisateur saisit credentials sur `/login`
2. Appel API `POST /api/login`
3. Réception du token JWT
4. Stockage + décodage du token
5. Redirection selon le rôle :
   - Admin → `/admin`
   - Commercial → `/commercial`
   - Maître d'œuvre → `/maitre-doeuvre`

---

## 🎯 Gestion d'état

### Providers globaux

Dans `App.tsx`, les providers sont imbriqués dans cet ordre :

```tsx
<BrowserRouter>
  <OnlineProvider>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </OnlineProvider>
</BrowserRouter>
```

### Hooks disponibles

#### `useAuth()`
Gestion de l'authentification.

```tsx
const { user, login, logout, isLoading } = useAuth()
```

#### `useToast()`
Affichage de notifications toast.

```tsx
const { addToast } = useToast()

addToast('Sauvegarde réussie', 'success')
addToast('Erreur serveur', 'error')
addToast('Information', 'info')
```

#### `useOnline()`
Détection de la connexion internet.

```tsx
const online = useOnline()

if (!online) {
  return <p>Vous êtes hors ligne</p>
}
```

---

## 🎨 Styling

### Tailwind CSS

Configuration personnalisée dans `index.css` avec le bloc `@theme` :

```css
@theme {
  --color-primary: #3B32EC;
  --color-secondary: #F0F0F0;
  --color-border: #D6D6D6;
  --color-red: #DA2551;
  --color-red-bg: #FBF3F5;
  --color-black: #000;
  --color-placeholder: #515970;
}
```

**Utilisation :**
```tsx
<div className="bg-primary text-white border-border">
  Contenu
</div>
```

### Police personnalisée

**Manrope** (Google Fonts) appliquée globalement :

```css
font-family: 'Manrope', Avenir, Helvetica, Arial, sans-serif;
```

### Animations

Animations custom disponibles :

```tsx
// Toast entrant depuis la droite
className="animate-[toast-in_0.4s_ease]"

// Badge réseau avec rebond
className="animate-[online-in-bouncy_0.6s_cubic-bezier(.22,.68,.37,1.05)]"
```

---

## 🧩 Composants

Voir la [documentation complète des composants](./src/components/README.md).

### Composants principaux

- **Button** - Bouton avec 3 variantes + loading
- **Input, NumInput, Textarea** - Champs de formulaire
- **Select, Checkbox, Calendar** - Sélecteurs
- **Popover** - Menu contextuel intelligent
- **Sidebar** - Navigation repliable (Ctrl/Cmd+B)
- **HeaderBar** - En-tête utilisateur
- **DashboardLayout** - Layout principal

### Patterns de composants

```tsx
// Composant contrôlé
const [value, setValue] = useState('')

<Input
  label="Email"
  value={value}
  onChange={setValue}
  required
/>

// Bouton avec loading
<Button 
  variant="Primary" 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Enregistrer
</Button>

// Menu contextuel
<Popover icon={DotsVerticalSolid}>
  <Popover.Item icon={Edit} onClick={handleEdit}>
    Éditer
  </Popover.Item>
  <Popover.Item icon={Trash} variant="destructive">
    Supprimer
  </Popover.Item>
</Popover>
```

---

**Configuration supplémentaire :**
- Ajouter un fichier `_redirects` dans `/public` pour le routing :
  ```
  /*    /index.html   200
  ```

---

## 🧪 Tests (À venir)

Structure prévue pour les tests :

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
```

Librairies recommandées :
- **Vitest** - Runner de tests
- **Testing Library** - Tests de composants
- **MSW** - Mock API

---

## 🔧 Configuration TypeScript

`tsconfig.json` configuré pour :
- Imports absolus via `@/` (alias vers `src/`)
- Strict mode activé
- React 19 + JSX automatic runtime
- Résolution de modules ESNext

Exemple d'import :

```tsx
import Button from '@/components/Button'
import { useAuth } from '@/context/AuthContext'
```

---

## 📝 Bonnes pratiques

### ✅ À faire

- Utiliser TypeScript pour tous les composants
- Déclarer les interfaces de props
- Utiliser les hooks personnalisés (useAuth, useToast...)
- Respecter la structure de dossiers
- Commiter avec des messages descriptifs
- Utiliser les variantes de composants existantes

### ❌ À éviter

- Dupliquer les providers dans les composants
- Stocker des données sensibles dans localStorage sans chiffrement
- Oublier les props `required` sur les champs obligatoires

---

## 🐛 Débogage


### Network

Vérifier les appels API dans l'onglet Network :
- Headers (Authorization: Bearer ...)
- Response status
- Payload

---

## 🤝 Contribution

1. Créer une branche feature : `git checkout -b feature/ma-feature`
2. Commiter les changements : `git commit -m "feat: description"`
3. Pusher : `git push origin feature/ma-feature`
4. Créer une Pull Request

### Convention de commits

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, CSS
- `refactor:` - Refactoring
- `test:` - Ajout de tests

---

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Myna UI Icons](https://icons.mynaui.com/)
- [Composants docs](./src/components/README.md)

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les README dans `/src/components` et `/src/context`
2. Vérifier les issues GitHub

---

**Version:** 0.0.1  
**Dernière mise à jour:** 9 novembre 2025  
**Projet:** Bati'Parti - Frontend React
