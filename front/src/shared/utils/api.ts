/**
 * Configuration API et fonctions helper pour les requêtes HTTP
 */

import type { AxiosError } from 'axios'

// Configuration de base
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export const API_TIMEOUT = 10000

// Headers par défaut
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Gestion des erreurs API
export interface ApiError {
  message: string
  status: number
  code?: string
  errors?: Record<string, string[]>
}

export const handleApiError = (error: unknown): ApiError => {
  if (isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'Une erreur est survenue',
      status: error.response?.status || 500,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors
    }
  }
  
  return {
    message: 'Erreur réseau',
    status: 0
  }
}

export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined
}

// Helper pour les requêtes
export const buildUrl = (path: string, params?: Record<string, string | number>): string => {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  return url.toString()
}

// Interceptors helpers
export const isUnauthorized = (error: ApiError): boolean => {
  return error.status === 401
}

export const isForbidden = (error: ApiError): boolean => {
  return error.status === 403
}

export const isNotFound = (error: ApiError): boolean => {
  return error.status === 404
}

export const isServerError = (error: ApiError): boolean => {
  return error.status >= 500
}