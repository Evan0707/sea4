import { useState, type ReactNode } from 'react'
import ConfirmModal from './ConfirmModal'

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
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    </>
  )
}

export default ConfirmPopover
