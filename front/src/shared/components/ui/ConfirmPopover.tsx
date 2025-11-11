import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

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
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
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
    setIsOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>

      {isOpen && createPortal(
        <>
          {/* Overlay assombri */}
          <div 
            className="fixed inset-0 bg-black/50 z-[99999] animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover centrée */}
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div 
              ref={popoverRef}
              className="bg-white rounded-lg shadow-lg border border-border p-6 min-w-[320px] max-w-[400px] animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-[18px] text-black mb-3">{title}</h3>
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