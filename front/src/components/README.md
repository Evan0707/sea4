# 📦 Composants Bati'Parti

Documentation des composants réutilisables du projet.

---

## 🎨 Composants UI

### Button

Bouton personnalisé avec 3 variantes et état de chargement.

**Props:**
```tsx
interface ButtonProps {
  children: ReactNode        // Contenu du bouton
  variant: 'Primary' | 'Secondary' | 'Destructive'
  classname?: string         // Classes CSS additionnelles
  onClick?: () => void       // Fonction de clic
  loading?: boolean          // Affiche un spinner
  type?: 'button' | 'submit' | 'reset'
}
```

**Exemples:**
```tsx
import Button from '@/components/Button'

// Bouton principal
<Button variant="Primary" onClick={() => console.log('Clic')}>
  Enregistrer
</Button>

// Bouton secondaire
<Button variant="Secondary">
  Annuler
</Button>

// Bouton destructif
<Button variant="Destructive">
  Supprimer
</Button>

// Avec chargement
<Button variant="Primary" loading={isLoading}>
  Chargement...
</Button>

// Bouton submit dans un formulaire
<Button variant="Primary" type="submit">
  Valider
</Button>
```

---

### Input

Champ de saisie texte avec label, placeholder et gestion d'erreur.

**Props:**
```tsx
interface InputProps {
  label?: string             // Label du champ
  placeholder?: string       // Texte indicatif
  type?: string             // Type HTML (text, email, password...)
  value: string             // Valeur contrôlée
  onChange: (value: string) => void
  error?: string            // Message d'erreur
  required?: boolean        // Champ obligatoire
  disabled?: boolean        // Désactivé
}
```

**Exemples:**
```tsx
import Input from '@/components/Input'

const [email, setEmail] = useState('')
const [error, setError] = useState('')

<Input
  label="Email"
  placeholder="exemple@mail.com"
  type="email"
  value={email}
  onChange={setEmail}
  error={error}
  required
/>

// Mot de passe
<Input
  label="Mot de passe"
  type="password"
  value={password}
  onChange={setPassword}
/>
```

---

### NumInput

Champ de saisie numérique avec contrôles +/-.

**Props:**
```tsx
interface NumInputProps {
  label?: string
  placeholder?: string
  value: number
  onChange: (value: number) => void
  min?: number              // Valeur minimale
  max?: number              // Valeur maximale
  step?: number             // Incrément
  error?: string
  required?: boolean
}
```

**Exemples:**
```tsx
import NumInput from '@/components/NumInput'

const [quantity, setQuantity] = useState(1)

<NumInput
  label="Quantité"
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={100}
  step={1}
/>

// Prix avec décimales
<NumInput
  label="Prix (€)"
  value={price}
  onChange={setPrice}
  min={0}
  step={0.01}
/>
```

---

### Textarea

Zone de texte multi-lignes.

**Props:**
```tsx
interface TextareaProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number             // Hauteur en lignes
  error?: string
  required?: boolean
  disabled?: boolean
}
```

**Exemples:**
```tsx
import Textarea from '@/components/Textarea'

const [description, setDescription] = useState('')

<Textarea
  label="Description"
  placeholder="Décrivez votre projet..."
  value={description}
  onChange={setDescription}
  rows={5}
/>
```

---

### Select

Liste déroulante personnalisée.

**Props:**
```tsx
interface SelectProps {
  label?: string
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}
```

**Exemples:**
```tsx
import Select from '@/components/Select'

const [role, setRole] = useState('')

<Select
  label="Rôle"
  options={[
    { value: 'admin', label: 'Administrateur' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'maitre', label: 'Maître d\'œuvre' }
  ]}
  value={role}
  onChange={setRole}
  placeholder="Sélectionnez un rôle"
/>
```

---

### Checkbox

Case à cocher avec label.

**Props:**
```tsx
interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}
```

**Exemples:**
```tsx
import Checkbox from '@/components/Checkbox'

const [accepted, setAccepted] = useState(false)

<Checkbox
  label="J'accepte les conditions d'utilisation"
  checked={accepted}
  onChange={setAccepted}
/>
```

---

### Calendar

Sélecteur de date.

**Props:**
```tsx
interface CalendarProps {
  value: Date | null
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
}
```

**Exemples:**
```tsx
import Calendar from '@/components/Calendar'

const [date, setDate] = useState<Date | null>(null)

<Calendar
  label="Date de début"
  value={date}
  onChange={setDate}
  placeholder="Sélectionnez une date"
/>
```

---

### Popover

Menu contextuel avec positionnement automatique.

**Props:**
```tsx
interface PopoverProps {
  children: ReactNode        // PopoverItems
  icon?: ComponentType       // Icône du trigger (Myna UI)
  iconSize?: number         // Taille de l'icône
}

interface PopoverItemProps {
  variant?: 'default' | 'destructive'
  children: ReactNode
  icon?: ComponentType      // Icône de l'item
  onClick?: () => void
}
```

**Exemples:**
```tsx
import Popover from '@/components/Popover'
import { DotsVerticalSolid, Edit, Trash } from '@mynaui/icons-react'

<Popover icon={DotsVerticalSolid} iconSize={20}>
  <Popover.Item 
    icon={Edit} 
    onClick={() => handleEdit()}
  >
    Éditer
  </Popover.Item>
  
  <Popover.Item 
    icon={Trash} 
    variant="destructive"
    onClick={() => handleDelete()}
  >
    Supprimer
  </Popover.Item>
</Popover>
```

**Fonctionnalités:**
- ✅ Positionnement intelligent (haut/bas selon l'espace disponible)
- ✅ Fermeture au clic extérieur
- ✅ Recalcul au scroll/resize
- ✅ Accessibilité (ARIA)

---

## 🎯 Composants Layout

### DashboardLayout

Layout principal de l'application avec sidebar et header.

**Props:**
```tsx
interface DashboardLayoutProps {
  user: User | null
  children: ReactNode
}
```

**Exemple:**
```tsx
import { DashboardLayout } from '@/components/DashboardLayout'

<DashboardLayout user={currentUser}>
  <div>Contenu de la page</div>
</DashboardLayout>
```

---

### Sidebar

Barre latérale de navigation (utilisée par DashboardLayout).

**Props:**
```tsx
interface SidebarProps {
  user: User | null
  items: NavItem[]          // Liens de navigation
  onLogout: () => void
}
```

**Fonctionnalités:**
- ✅ Mode replié/étendu (toggle + Ctrl/Cmd+B)
- ✅ État sauvegardé automatiquement
- ✅ Filtrage des liens par rôle utilisateur
- ✅ Animation fluide

---

### HeaderBar

En-tête avec informations utilisateur.

**Props:**
```tsx
interface HeaderBarProps {
  user: User | null
}
```

---

## 🔔 Système de Notifications

### useToast (Hook)

Hook pour afficher des notifications toast.

**API:**
```tsx
const { addToast } = useToast()

addToast(message: string, variant?: 'info' | 'error' | 'success')
```

**Exemples:**
```tsx
import { useToast } from '@/context/useToast'

function MyComponent() {
  const { addToast } = useToast()

  const handleSave = async () => {
    try {
      await saveData()
      addToast('Données enregistrées', 'success')
    } catch (error) {
      addToast('Erreur lors de l\'enregistrement', 'error')
    }
  }

  return <button onClick={handleSave}>Enregistrer</button>
}
```

**Fonctionnalités:**
- ✅ 3 variantes (info, success, error)
- ✅ Icônes automatiques
- ✅ Fermeture auto après 5s
- ✅ Fermeture manuelle (bouton ×)
- ✅ Animation d'entrée (slide from right)
- ✅ Empilement intelligent
- ✅ Truncate pour messages longs

---

### Tooltip

Infobulle apparaissant au survol avec positionnement intelligent.

**Props:**
```tsx
interface TooltipProps {
  children: ReactNode              // Élément à entourer
  content: string                  // Texte du tooltip
  position?: 'top' | 'bottom' | 'left' | 'right'  // Position (défaut: 'top')
}
```

**Exemples:**
```tsx
import Tooltip from '@/components/Tooltip'

// Position par défaut (top)
<Tooltip content="Éditer ce client">
  <button>
    <Edit size={20} />
  </button>
</Tooltip>

// Position personnalisée
<Tooltip content="Supprimer définitivement" position="right">
  <button className="text-red">
    <Trash size={20} />
  </button>
</Tooltip>

// Sur du texte
<Tooltip content="Cliquez pour copier l'adresse">
  <span className="cursor-pointer">
    123 rue de la Paix, 75000 Paris
  </span>
</Tooltip>
```

**Fonctionnalités:**
- ✅ Apparition au survol (hover)
- ✅ 4 positions disponibles (top, bottom, left, right)
- ✅ Détection automatique du viewport (reste visible à l'écran)
- ✅ Flèche pointant vers l'élément
- ✅ Animation fade-in douce (0.15s)
- ✅ Max-width 300px pour textes longs
- ✅ Positionnement dynamique en `fixed`
- ✅ Z-index élevé (50) pour superposition

**Styling:**
- Fond noir avec texte blanc
- Bordure arrondie (rounded-md)
- Padding confortable (px-3 py-1.5)
- Taille texte 14px (text-sm)
- Ombre portée pour profondeur

---

## 🌐 Détection de Connexion

### useOnline (Hook)

Hook pour détecter l'état de connexion internet.

**API:**
```tsx
const online: boolean = useOnline()
```

**Exemples:**
```tsx
import { useOnline } from '@/context/useOnline'

function MyComponent() {
  const online = useOnline()

  return (
    <div>
      {!online && <p>Vous êtes hors ligne</p>}
      <button disabled={!online}>Synchroniser</button>
    </div>
  )
}
```

**Fonctionnalités:**
- ✅ Détection automatique online/offline
- ✅ Notification visuelle (badge animé)
- ✅ Mise à jour en temps réel

---

## 🎨 Configuration du Thème

### Couleurs personnalisées

Définies dans `src/index.css` avec le bloc `@theme`:

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

**Utilisation dans Tailwind:**
```tsx
<div className="bg-primary text-white border-border">...</div>
```

---

## 🚀 Animations

### Animations disponibles

Définies dans `src/index.css`:

**toast-in** - Entrée depuis la droite avec bounce
```tsx
className="animate-[toast-in_0.4s_ease]"
```

**online-in-bouncy** - Apparition avec rebond (pour badge réseau)
```tsx
className="animate-[online-in-bouncy_0.6s_cubic-bezier(.22,.68,.37,1.05)]"
```

**fade-in** - Apparition en fondu (pour tooltip)
```tsx
className="animate-[fade-in_0.15s_ease]"
```

**Keyframes personnalisés:**
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 📋 Bonnes Pratiques

### ✅ À faire

- Toujours importer les types depuis les props
- Utiliser le hook `useToast` pour les notifications
- Wrapper l'app avec `ToastProvider` et `OnlineProvider` dans `App.tsx`
- Utiliser les variantes de couleur du thème
- Ajouter `aria-label` sur les boutons icône

### ❌ À éviter

- Ne pas dupliquer ToastProvider dans les composants enfants
- Ne pas oublier les props `required` sur les champs obligatoires
- Ne pas utiliser `onClick` sur des éléments non interactifs
- Éviter les classes inline quand une variante existe

---

## 🛠️ Développement

### Structure des composants

```
components/
├── Button.tsx
├── Input.tsx
├── Popover.tsx
├── README.md           ← Ce fichier
└── layout/
    ├── Sidebar.tsx
    └── HeaderBar.tsx
```

### Ajouter un nouveau composant

1. Créer le fichier dans `/components`
2. Définir l'interface des props avec TypeScript
3. Exporter par défaut le composant
4. Ajouter la documentation dans ce README
5. (Optionnel) Ajouter un exemple dans `/playground`

---

## 📚 Ressources

- [Myna UI Icons](https://icons.mynaui.com/) - Icônes utilisées
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [React Hook Form](https://react-hook-form.com/) - Gestion formulaires (si ajouté)

---

**Dernière mise à jour:** 9 novembre 2025  
**Projet:** Bati'Parti - Gestion de dossiers et projets
