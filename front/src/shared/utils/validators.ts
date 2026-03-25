/**
 * Fonctions de validation pour formulaires et données
 */

import { z } from "zod";

// ============================================
// Schémas Zod pour formulaires
// ============================================

/**
 * Schéma de validation pour le formulaire de connexion
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schéma de validation pour le formulaire Client (nouveau dossier)
 */
export const clientFormSchema = z.object({
  nomClient: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  prenomClient: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  adresseClient: z
    .string()
    .min(1, "L'adresse est requise")
    .max(100, "L'adresse ne peut pas dépasser 100 caractères"),
  cpClient: z
    .string()
    .min(1, "Le code postal est requis")
    .regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres requis)"),
  villeClient: z
    .string()
    .min(1, "La ville est requise")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

/**
 * Schéma de validation pour le formulaire Chantier (nouveau dossier)
 */
export const chantierFormSchema = z.object({
  adresseChantier: z
    .string()
    .min(1, "L'adresse du chantier est requise")
    .max(100, "L'adresse ne peut pas dépasser 100 caractères"),
  cpChantier: z
    .string()
    .min(1, "Le code postal est requis")
    .regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres requis)"),
  villeChantier: z
    .string()
    .min(1, "La ville est requise")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  dateCreation: z.string().min(1, "La date de création est requise"),
  statutChantier: z.enum(['À compléter', 'À venir', 'En chantier', 'Terminé']),
  noMOE: z.number().optional().refine((v) => v !== undefined && v !== null, { message: "Le maître d'œuvre est requis" }),
  noModele: z.number().optional().refine((v) => v !== undefined && v !== null, { message: "Le modèle est requis" }),
});

export type ChantierFormData = z.infer<typeof chantierFormSchema>;


// ============================================
// Fonctions de validation simples
// ============================================

// Email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Téléphone français
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone)
}

// Code postal français
export const isValidPostalCode = (code: string): boolean => {
  return /^[0-9]{5}$/.test(code)
}

// SIRET
export const isValidSiret = (siret: string): boolean => {
  if (!/^\d{14}$/.test(siret)) return false

  // Algorithme de Luhn
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i])
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// Mot de passe fort
export const isStrongPassword = (password: string): boolean => {
  // Min 8 chars, 1 maj, 1 min, 1 chiffre, 1 spécial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak'
  if (password.length < 10) return 'medium'
  if (isStrongPassword(password)) return 'strong'
  return 'medium'
}

export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0
}

// Schéma pour la création d'un utilisateur via l'admin
export const createUserSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  nom: z.string().min(1, "Le nom est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  login: z.string().min(3, "Le login doit contenir au moins 3 caractères").max(50, "Le login est trop long"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(['admin', 'commercial', 'maitre_oeuvre']),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

// Schéma pour la modification d'un utilisateur via l'admin
export const updateUserSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  nom: z.string().min(1, "Le nom est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  login: z.string().min(3, "Le login doit contenir au moins 3 caractères").max(50, "Le login est trop long"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal('')),
  role: z.enum(['admin', 'commercial', 'maitre_oeuvre']),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>

// Schéma pour la création/modification d'un artisan
export const artisanSchema = z.object({
  nomArtisan: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  prenomArtisan: z.string().max(50, 'Le prénom ne peut pas dépasser 50 caractères').optional().or(z.literal('')),
  emailArtisan: z.string().email('Email invalide').optional().or(z.literal('')),
  telArtisan: z.string().max(20, 'Téléphone trop long').optional().or(z.literal('')),
  adresseArtisan: z.string().max(100, "L'adresse ne peut pas dépasser 100 caractères").optional().or(z.literal('')),
  cpArtisan: z.string().regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres requis)').optional().or(z.literal('')),
  villeArtisan: z.string().max(50, 'La ville ne peut pas dépasser 50 caractères').optional().or(z.literal('')),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  }).refine(
      (data) => !data.newPassword || data.newPassword === data.confirmPassword,
      {
          message: 'Les deux mots de passe sont différents !',
          path: ['confirmPassword'],
      }
  )


export type ArtisanFormData = z.infer<typeof artisanSchema>