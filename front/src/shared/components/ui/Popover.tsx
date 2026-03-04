import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATIONS } from '../../constants/animations'
import { DotsVerticalSolid } from '@mynaui/icons-react'
import { useState, useRef, useEffect } from 'react'
import type { ReactNode, ComponentType } from 'react'
import { cn } from '@/shared/lib/utils'

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

const Popover = ({ children, icon: Icon = DotsVerticalSolid, iconSize = 20 }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return
    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const contentRect = contentRef.current!.getBoundingClientRect()
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const popoverHeight = contentRect.height || 200
      setPosition(spaceBelow < popoverHeight && spaceAbove > spaceBelow ? 'top' : 'bottom')
    }
    calculatePosition()
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
        className="p-1.5 rounded-[var(--radius)] text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        <Icon size={iconSize} className="text-text-primary" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={ANIMATIONS.scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            ref={contentRef}
            className={cn(
              'absolute right-0 w-48 bg-bg-primary rounded-[var(--radius)] shadow-md border border-border z-50 p-1',
              position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
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
    default: 'hover:bg-bg-secondary text-text-primary',
    destructive: 'hover:bg-bg-secondary text-red',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-1.5 rounded-[calc(var(--radius)-2px)] text-left text-sm flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        variant === 'destructive'
          ? 'text-red hover:bg-red/8'
          : 'text-text-primary hover:bg-bg-secondary'
      )}
    >
      {Icon && <Icon size={15} className="shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  )
}

Popover.Item = PopoverItem

export default Popover