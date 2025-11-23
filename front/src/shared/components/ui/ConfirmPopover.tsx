import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { H3 } from './Typography'

interface ConfirmPopoverProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  children: ReactNode
  confirmText?: string
  cancelText?: string
}

const ConfirmPopover = ({
  title,
  message,
  onConfirm,
  onCancel,
  children,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}: ConfirmPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isClosing) {
      // Petit délai pour déclencher l'animation d'ouverture
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    }
  }, [isOpen, isClosing])

  const closePopover = () => {
    setIsClosing(true)
    setIsAnimating(false)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover()
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    closePopover()
  }

  const handleCancel = () => {
    onCancel?.()
    closePopover()
  }

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>

      {isOpen && createPortal(
        <>
          {/* Overlay assombri */}
          <div 
            className={`fixed inset-0 bg-black/50 z-[99999] transition-opacity duration-200 ${
              isAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closePopover}
          />
          
          {/* Popover centrée */}
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            onClick={closePopover}
          >
            <div 
              ref={popoverRef}
              className={`bg-bg-primary rounded-lg shadow-lg border border-border p-6 min-w-[320px] max-w-[400px] transition-all duration-200 ${
                isClosing ? 'scale-95 opacity-0' : isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <H3 className="font-bold text-[18px] text-black mb-3">{title}</H3>
              <p className="text-[14px] text-placeholder mb-6">{message}</p>
              <div className="flex gap-3 justify-end">
                <Button variant="Secondary" onClick={handleCancel} classname="px-6 py-2">
                  {cancelText}
                </Button>
                <Button variant="Destructive" onClick={handleConfirm} classname="px-6 py-2">
                  {confirmText}
                </Button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

export default ConfirmPopover