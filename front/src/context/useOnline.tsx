import { Aeroplane } from '@mynaui/icons-react'
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// Important: default to undefined so consumers outside the provider throw
const OnlineContext = createContext<boolean | undefined>(undefined)

export function OnlineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setOnline(false)
    const handleOnline = () => setOnline(true)

    window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <OnlineContext.Provider value={online}>
      {!online && <p className="fixed flex animate-[online-in-bouncy_0.3s_ease] items-center absolute top-3 right-[50%] translate-x-[50%] bg-slate-900 text-white px-4 py-2 rounded-[40px] shadow-lg z-50 text-sm"><Aeroplane className='mr-2' size={18}/> Hors ligne</p>}
      {children}
    </OnlineContext.Provider>
  )
}

export function useOnline() {
  const context = useContext(OnlineContext)
  if (context === undefined) throw new Error('useOnline must be used within an OnlineProvider')
  return context
}