import { CheckCircleSolid, DangerCircleSolid, InfoCircleSolid } from '@mynaui/icons-react'
import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export type ToastType = 'info' | 'error' | 'success'

export interface ToastProps {
  id: number
  message: string
  variant: ToastType
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (message: string, variant?: ToastType) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((message: string, variant: ToastType = 'info') => {
    const id = Date.now()
    setToasts((prev) => [
      ...prev,
      { id: id, message, variant }
    ])

    setTimeout(()=>{
        removeToast(id)
    },5000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Affichage global des toasts */}

        <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
            {toasts.map((v, i) => (
            <div
                key={v.id}
                className={`
                animate-[toast-in_0.4s_ease]
                px-4 rounded shadow-lg flex items-center justify-between
                transition-all
                border-[1.5px]
                border-b-3
                box-border
                w-[400px]
                relative
                ${v.variant === 'success'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-500'
                    : v.variant === 'error'
                    ? 'bg-red-bg border-red text-red'
                    : 'bg-blue-100 text-blue-500'
                }
                `}
                role="alert"
                style={{
                marginBottom: i === toasts.length - 1 ? 0 : '0.5rem',
                transform: `translateY(-${i * 10}px)`
                }}
            >
                <div className='flex items-center min-w-0'>
                  {
                    v.variant=='success'&&<CheckCircleSolid className='mr-2 flex-none'/>||
                    v.variant=='error'&&<DangerCircleSolid className='mr-2 flex-none'/>||
                    v.variant=='info'&&<InfoCircleSolid className='mr-2 flex-none'/>
                  }
                  <span className='ml-1 flex-1 min-w-0 truncate text-sm'>{v.message}</span>
                </div>
                <button
                className="ml-4 text-xl p-2 font-bold cursor-pointer flex-none"
                onClick={() => removeToast(v.id)}
                aria-label="Fermer"
                >
                ×
                </button>
            </div>
            ))}
        </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}