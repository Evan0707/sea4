import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATIONS } from '@/shared/constants/animations'
import Button from './Button'
import { H3 } from './Typography'

interface ConfirmModalProps {
 isOpen: boolean
 onClose: () => void
 onConfirm: () => void
 title: string
 message: string
 confirmText?: string
 cancelText?: string
}

const ConfirmModal = ({
 isOpen,
 onClose,
 onConfirm,
 title,
 message,
 confirmText = 'Confirmer',
 cancelText = 'Annuler',
}: ConfirmModalProps) => {
 const modalRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
  const handleEscKey = (event: KeyboardEvent) => {
   if (event.key === 'Escape') onClose()
  }
  if (isOpen) document.addEventListener('keydown', handleEscKey)
  return () => document.removeEventListener('keydown', handleEscKey)
 }, [isOpen, onClose])

 return createPortal(
  <AnimatePresence>
   {isOpen && (
    <>
     <motion.div
      variants={ANIMATIONS.fadeIn}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 bg-black/50 z-[99999]"
      onClick={onClose}
     />
     <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
      <motion.div
       variants={ANIMATIONS.scaleIn}
       initial="hidden"
       animate="show"
       exit="exit"
       ref={modalRef}
       className="bg-bg-secondary/60 backdrop-blur-xl rounded-[var(--radius-lg)] shadow-2xl border border-border/50 p-6 min-w-[320px] max-w-[400px] pointer-events-auto"
       onClick={(e) => e.stopPropagation()}
      >
       <H3 className="font-semibold text-text-primary mb-2">{title}</H3>
       <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
       <div className="flex gap-3 justify-end">
        <Button variant="Secondary" size="sm" onClick={onClose}>
         {cancelText}
        </Button>
        <Button variant="Destructive" size="sm" onClick={() => { onConfirm(); onClose(); }}>
         {confirmText}
        </Button>
       </div>
      </motion.div>
     </div>
    </>
   )}
  </AnimatePresence>,
  document.body
 )
}

export default ConfirmModal
