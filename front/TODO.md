# 📋 TODO - Création d'un nouveau dossier

## Vue d'ensemble
Implémenter un formulaire multi-étapes pour créer un nouveau dossier (Client + Chantier) dans l'application Bati'Parti.

---

## ✅ Tâches

### 1. Créer le formulaire multi-étapes
**Priorité:** Haute  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Créer un composant `NouveauDossierForm` avec 3 étapes :
  - Étape 1 : Informations client
  - Étape 2 : Informations chantier
  - Étape 3 : Récapitulatif
- [ ] Utiliser `useState` pour gérer :
  - `currentStep` (1, 2, ou 3)
  - `clientData` (données du formulaire client)
  - `chantierData` (données du formulaire chantier)

```tsx
const [currentStep, setCurrentStep] = useState(1)
const [clientData, setClientData] = useState<ClientFormData>({})
const [chantierData, setChantierData] = useState<ChantierFormData>({})
```

---

### 2. Étape 1 - Formulaire Client
**Priorité:** Haute  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Créer le formulaire avec les champs suivants :
  - `nom` (required) - Input texte
  - `prenom` (required) - Input texte
  - `adresse` (optional) - Input texte
  - `codePostal` (optional, 5 chars max) - Input texte avec validation
  - `ville` (optional) - Input texte
- [ ] Utiliser les composants `Input` existants
- [ ] Ajouter validation pour code postal (5 chiffres)

**Mapping avec Entity Client (PHP):**
- `nom` → `nomClient`
- `prenom` → `prenomClient`
- `adresse` → `adresseClient`
- `codePostal` → `cpClient`
- `ville` → `villeClient`

---

### 3. Étape 2 - Formulaire Chantier
**Priorité:** Haute  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Créer le formulaire avec les champs suivants :
  - `adresse` (optional) - Input texte
  - `codePostal` (optional, 5 chars max) - Input texte
  - `ville` (optional) - Input texte
  - `dateCreation` (auto aujourd'hui) - Calendar component
  - `statut` (default 'À compléter') - Select ou readonly
- [ ] Utiliser le composant `Calendar` pour la sélection de date
- [ ] Pré-remplir `dateCreation` avec la date du jour
- [ ] Pré-remplir `statut` avec 'À compléter'

**Mapping avec Entity Chantier (PHP):**
- `adresse` → `adresseChantier`
- `codePostal` → `cpChantier`
- `ville` → `villeChantier`
- `dateCreation` → `dateCreation`
- `statut` → `statutChantier`

---

### 4. Étape 3 - Récapitulatif
**Priorité:** Moyenne  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Afficher un résumé structuré des données :
  - **Informations Client** : nom, prénom, adresse complète
  - **Informations Chantier** : adresse, date de création, statut
- [ ] Ajouter des boutons pour :
  - Modifier le client (retour étape 1)
  - Modifier le chantier (retour étape 2)
  - Confirmer et créer le dossier
- [ ] Design : utiliser des cards avec sections distinctes

---

### 5. Créer les types TypeScript
**Priorité:** Haute  
**Fichier:** `front/src/types/dossier.ts`

- [ ] Créer l'interface `ClientFormData` :
```typescript
export interface ClientFormData {
  nom: string
  prenom: string
  adresse?: string
  codePostal?: string
  ville?: string
}
```

- [ ] Créer l'interface `ChantierFormData` :
```typescript
export interface ChantierFormData {
  adresse?: string
  codePostal?: string
  ville?: string
  dateCreation: Date
  statut: string
}
```

- [ ] Créer l'interface `DossierFormData` :
```typescript
export interface DossierFormData {
  client: ClientFormData
  chantier: ChantierFormData
}
```

---

### 6. Créer l'endpoint API Backend
**Priorité:** Haute  
**Fichier:** `back/src/Controller/DossierController.php`

- [ ] Créer un nouveau contrôleur `DossierController`
- [ ] Implémenter l'endpoint `POST /api/dossiers` :
  - Accepter JSON avec structure : `{ client: {...}, chantier: {...} }`
  - Créer l'entité `Client` en premier
  - Persister le client et récupérer son ID
  - Créer l'entité `Chantier` et lier au client via `setClient()`
  - Persister le chantier
  - Retourner JSON : `{ client: {...}, chantier: {...} }` avec les IDs générés
- [ ] Ajouter la validation des données (Symfony Validator)
- [ ] Gérer les erreurs (catch exceptions, retourner 400/500)
- [ ] Tester avec Postman ou curl

**Route attendue:**
```php
#[Route('/api/dossiers', methods: ['POST'])]
public function create(Request $request): JsonResponse
```

---

### 7. Implémenter la soumission du formulaire
**Priorité:** Haute  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Créer la fonction `handleSubmit` :
```typescript
const handleSubmit = async () => {
  setIsSubmitting(true)
  try {
    const response = await fetch('http://localhost:8000/api/dossiers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        client: clientData,
        chantier: chantierData
      })
    })
    
    if (!response.ok) throw new Error('Erreur lors de la création')
    
    addToast('Dossier créé avec succès', 'success')
    navigate('/commercial/dossiers')
  } catch (error) {
    addToast('Erreur lors de la création du dossier', 'error')
  } finally {
    setIsSubmitting(false)
  }
}
```

- [ ] Utiliser `useToast` pour les notifications
- [ ] Utiliser `useNavigate` pour la redirection
- [ ] Gérer les erreurs réseau et serveur

---

### 8. Ajouter la navigation entre étapes
**Priorité:** Haute  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Créer les fonctions de navigation :
```typescript
const handleNext = () => {
  if (validateCurrentStep()) {
    setCurrentStep(prev => prev + 1)
  }
}

const handlePrevious = () => {
  setCurrentStep(prev => prev - 1)
}
```

- [ ] Ajouter validation avant passage à l'étape suivante
- [ ] Créer un indicateur de progression visuel :
  - Afficher "Étape 1/3", "Étape 2/3", "Étape 3/3"
  - Utiliser des points/barres de progression
- [ ] Afficher les bons boutons selon l'étape :
  - Étape 1 : Annuler + Suivant
  - Étape 2 : Précédent + Suivant
  - Étape 3 : Précédent + Créer le dossier

---

### 9. Validation avec Zod
**Priorité:** Moyenne  
**Fichier:** `front/src/schemas/dossier.ts`

- [ ] Installer Zod si pas déjà fait : `npm install zod`
- [ ] Créer le schéma pour `ClientFormData` :
```typescript
import { z } from 'zod'

export const clientSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  adresse: z.string().optional(),
  codePostal: z.string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),
  ville: z.string().optional()
})
```

- [ ] Créer le schéma pour `ChantierFormData` :
```typescript
export const chantierSchema = z.object({
  adresse: z.string().optional(),
  codePostal: z.string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),
  ville: z.string().optional(),
  dateCreation: z.date(),
  statut: z.string()
})
```

- [ ] Intégrer avec `react-hook-form` :
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(clientSchema)
})
```

- [ ] Afficher les erreurs de validation sous chaque champ

---

### 10. Gérer les états de chargement
**Priorité:** Moyenne  
**Fichier:** `front/src/components/forms/NouveauDossierForm.tsx`

- [ ] Ajouter l'état `isSubmitting` :
```typescript
const [isSubmitting, setIsSubmitting] = useState(false)
```

- [ ] Désactiver tous les boutons pendant la soumission :
```tsx
<Button disabled={isSubmitting} onClick={handleNext}>
  Suivant
</Button>
```

- [ ] Afficher un loader sur le bouton final :
```tsx
<Button loading={isSubmitting} onClick={handleSubmit}>
  Créer le dossier
</Button>
```

- [ ] Empêcher la navigation entre étapes pendant l'envoi

---

## 🎯 Ordre d'exécution recommandé

1. **Types TypeScript** (tâche 5) - Base de données typée
2. **Endpoint Backend** (tâche 6) - API prête pour les tests
3. **Formulaire multi-étapes** (tâche 1) - Structure de base
4. **Étape 1 Client** (tâche 2) - Premier formulaire
5. **Étape 2 Chantier** (tâche 3) - Deuxième formulaire
6. **Navigation étapes** (tâche 8) - Permettre de naviguer
7. **Étape 3 Récapitulatif** (tâche 4) - Résumé
8. **Validation Zod** (tâche 9) - Sécuriser les données
9. **Soumission formulaire** (tâche 7) - Envoi API
10. **États de chargement** (tâche 10) - UX finale

---

## 📚 Ressources nécessaires

### Composants existants à utiliser
- `Button` (avec prop `loading`)
- `Input`
- `Calendar`
- `Select` (si besoin pour le statut)

### Hooks existants à utiliser
- `useToast()` - Notifications
- `useAuth()` - Récupérer le token JWT
- `useNavigate()` - Navigation après création

### Dépendances à installer
```powershell
npm install zod @hookform/resolvers
```

---

## 🐛 Points d'attention

- **Code postal** : Validation 5 chiffres exactement
- **Date création** : Format à vérifier entre frontend (Date) et backend (DateTime)
- **Token JWT** : Inclure dans Authorization header pour l'API
- **Relations** : Le chantier DOIT être lié à un client (noClient not null)
- **Statut par défaut** : "À compléter" (attention à l'accent)

---

## ✨ Améliorations futures

- [ ] Auto-complétion des adresses avec API (Google Places, etc.)
- [ ] Validation du code postal avec la ville correspondante
- [ ] Sauvegarde brouillon (localStorage) en cas de navigation accidentelle
- [ ] Upload de documents lors de la création du dossier
- [ ] Sélection d'un client existant au lieu de toujours créer un nouveau

---

**Dernière mise à jour :** 9 novembre 2025
