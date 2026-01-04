import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import './styles/animations.css'
import axios from 'axios'
// Define constants locally since we are moving away from api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const API_TIMEOUT = 10000

// Configure global axios defaults so existing imports don't need changes
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = API_TIMEOUT

// Attach JWT from localStorage to every request if present
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
