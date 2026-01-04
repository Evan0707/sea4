import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATIONS } from '../../constants/animations'
import { DotsVerticalSolid } from '@mynaui/icons-react'
import { useState, useRef, useEffect } from 'react'
import type { ReactNode, ComponentType } from 'react'

interface PopoverProps {
  children: ReactNode
  icon?: ComponentType<{ size?: number; className?: string }>
  iconSize?: number
}

interface PopoverItemProps {
  variant?: 'default' | 'destructive'
  children: ReactNode
  icon?: ComponentType<{ size?: number; className?: string }>
  onClick?: () => void
}

const Popover = ({ children, icon: Icon = DotsVerticalSolid, iconSize = 28 }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculer la meilleure position
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const contentRect = contentRef.current!.getBoundingClientRect()

      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const popoverHeight = contentRect.height || 200 // Fallback si pas encore rendu

      // Si pas assez d'espace en bas et plus d'espace en haut
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }

    // Calculer immédiatement
    calculatePosition()

    // Recalculer au scroll et resize
    window.addEventListener('scroll', calculatePosition, true)
    window.addEventListener('resize', calculatePosition)

    return () => {
      window.removeEventListener('scroll', calculatePosition, true)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border/60"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        <Icon size={iconSize} className="text-gray-700" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={ANIMATIONS.scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            ref={contentRef}
            className={`absolute right-2 w-48 bg-white/70 backdrop-blur-sm rounded-[var(--radius)] shadow-lg border-[1.5px] border-border/40 z-50 py-1 px-1 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const PopoverItem = ({ variant = 'default', children, icon: Icon, onClick }: PopoverItemProps) => {
  const variants = {
    default: 'hover:bg-gray-100 text-gray-900',
    destructive: 'hover:bg-red-50 text-red',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 rounded text-left text-sm flex items-center gap-2 transition-colors ${variants[variant]}`}
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  )
}

Popover.Item = PopoverItem

export default Popover