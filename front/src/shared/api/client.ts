import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

// URL de base de l'API (à configurer via .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
 baseURL: API_URL,
 headers: {
  'Content-Type': 'application/json',
 },
 timeout: 10000,
});

// Intercepteur de requête : Injection automatique du Token
apiClient.interceptors.request.use(
 (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
   config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
 },
 (error: AxiosError) => {
  return Promise.reject(error);
 }
);

// Intercepteur de réponse : Gestion centralisée des erreurs (ex: 401)
apiClient.interceptors.response.use(
 (response) => response,
 (error: AxiosError) => {
  if (error.response?.status === 401) {
   // Optionnel : Redirection auto vers login ou dispatch d'événement logout
   // window.location.href = '/login'; // À utiliser avec précaution
   console.warn('Session expirée ou non autorisée');
   // On pourrait aussi émettre un event pour que le AuthContext le catche
  }
  return Promise.reject(error);
 }
);

export default apiClient;
