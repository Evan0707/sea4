import { DangerCircle, InfoCircleSolid } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import Tooltip from './Tooltip'
import { Label } from './Typography'
import { motion, AnimatePresence } from 'framer-motion'

export type TextareaProps = {
  name: string
  label?: string
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  value?: string
  defaultValue?: string
  rows?: number
  disabled?: boolean
  width?: string
  required?: boolean
  info?: boolean
  message?: string
}

const Textarea: React.FC<TextareaProps> = ({
  name,
  label,
  placeholder,
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
  rows = 4,
  disabled,
  width = 'w-full',
  required = false,
  info = false,
  message = '',
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }

  const controlProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={cn(width, className)}>
      {(label || info) && (
        <div className="flex items-center mb-1.5">
          {label && (
            <Label className="block text-text-primary" weight="medium" htmlFor={inputId}>
              {label}
              {required && <span className="text-red ml-1">*</span>}
            </Label>
          )}
          {info && (
            <Tooltip content={message}>
              <InfoCircleSolid size={14} className="text-text-secondary ml-1.5 cursor-help" />
            </Tooltip>
          )}
        </div>
      )}

      <textarea
        id={inputId}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full resize-y rounded-[var(--radius)] border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-placeholder transition-[border-color,box-shadow]',
          'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
          hasError
            ? 'border-red focus:ring-red/25 focus:border-red'
            : 'border-border',
          disabled && 'cursor-not-allowed opacity-60 bg-bg-secondary'
        )}
        onChange={mergedOnChange}
        {...controlProps}
        name={reg.name ?? name}
        onBlur={reg.onBlur}
        ref={reg.ref}
      />

      <AnimatePresence>
        {hasError && (
          <motion.p
            id={describedBy}
            initial={{ opacity: 0, height: 0, x: 0 }}
            animate={{ opacity: 1, height: 'auto', x: [0, -5, 5, -3, 3, 0] }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1.5 text-xs font-medium text-red overflow-hidden origin-left"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Textarea