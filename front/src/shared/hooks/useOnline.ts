import { useContext } from 'react'
import { OnlineContext } from '@/shared/context/OnlineProvider'

export function useOnline() {
  const context = useContext(OnlineContext)
  if (context === undefined) throw new Error('useOnline must be used within an OnlineProvider')
  return context
}
