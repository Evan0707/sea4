import { useState, useCallback } from 'react'

export type ToastType = 'info' | 'error' | 'success'

export interface ToastProps {
  id: number
  message: string
  variant: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((message: string, variant: ToastType = 'info') => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now(), message, variant }
    ])


  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}