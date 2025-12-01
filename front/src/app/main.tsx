import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/animations.css'
import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/shared/utils/api'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
