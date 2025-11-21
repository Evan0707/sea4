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
    .min(1, "L'email est requis")
    .email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schéma de validation pour le formulaire d'inscription
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

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
  dateCreation: z.date({
    message: "La date de création est requise",
  }),
  statutChantier: z.enum(['À compléter', 'À venir', 'En chantier', 'Terminé']),
  noMOE: z.string().min(1, "Le maître d'œuvre est requis"),
  noModele: z.number({
    message: "Le modèle est requis",
  }).min(1, "Le modèle est requis"),
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