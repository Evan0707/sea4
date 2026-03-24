import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

// URL de base de l'API (à configurer via .env)
const API_URL =  'https://main-bvxea6i-yjbt5mr6fwn4g.fr-4.platformsh.site/';

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
   window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  return Promise.reject(error);
 }
);

export default apiClient;
