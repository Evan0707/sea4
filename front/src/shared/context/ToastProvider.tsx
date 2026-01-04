import { CheckCircleSolid, DangerCircleSolid, InfoCircleSolid } from '@mynaui/icons-react'
import { createContext, useState, useCallback, useMemo, type ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastType = 'info' | 'success' | 'error' | 'warning'

interface ToastProps {
  id: number
  message: string
  variant: ToastType
}

interface ToastContextType {
  addToast: (message: string, variant?: ToastType) => void
  removeToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

const ToastItem = ({ toast, index, onRemove }: { toast: ToastProps, index: number, onRemove: (id: number) => void }) => {
  const [isPaused, setIsPaused] = useState(false)

  const handleDismiss = useCallback(() => {
    onRemove(toast.id)
  }, [onRemove, toast.id])

  useEffect(() => {
    if (isPaused) return

    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [isPaused, handleDismiss])

  // Define styles based on variant
  const variantStyles = {
    success: {
      icon: <CheckCircleSolid className="w-5 h-5 text-emerald-500" />,
      bgIcon: 'bg-emerald-50',
    },
    error: {
      icon: <DangerCircleSolid className="w-5 h-5 text-red-500" />,
      bgIcon: 'bg-red-50',
    },
    info: {
      icon: <InfoCircleSolid className="w-5 h-5 text-blue-500" />,
      bgIcon: 'bg-blue-50',
    },
    warning: {
      icon: <InfoCircleSolid className="w-5 h-5 text-amber-500" />,
      bgIcon: 'bg-amber-50',
    }
  }

  const style = variantStyles[toast.variant || 'info']

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity: 1 - index * 0.15,
        y: -index * 12,
        scale: 1 - index * 0.05,
        zIndex: 50 - index
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`
        absolute bottom-0 right-0
        w-full p-4
        rounded-xl
        bg-white
        border border-gray-100
        shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        flex items-start gap-3
        pointer-events-auto
        cursor-grab active:cursor-grabbing
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      {/* Icon Wrapper */}
      <div className={`flex-none p-2 rounded-full ${style.bgIcon} mt-0.5`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1.5">
        <p className="text-sm font-medium text-gray-900 leading-none">
          {toast.variant === 'error' ? 'Erreur' : toast.variant === 'success' ? 'Succès' : toast.variant === 'warning' ? 'Attention' : 'Information'}
        </p>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        className="flex-none -mr-2 -mt-2 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
        aria-label="Fermer"
      >
        <span className="text-xl leading-none block">×</span>
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, variant: ToastType = 'info') => {
    const id = Date.now()
    setToasts((prev) => [
      ...prev,
      { id: id, message, variant }
    ])
  }, [])

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Affichage global des toasts */}

      <div className="fixed right-4 bottom-4 w-full max-w-[400px] h-[100px] z-50 pointer-events-none p-4 sm:p-0">
        <AnimatePresence>
          {toasts.slice(-3).map((v, i, arr) => {
            const index = arr.length - 1 - i; // 0 for newest
            return (
              <ToastItem
                key={v.id}
                toast={v}
                index={index}
                onRemove={removeToast}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

