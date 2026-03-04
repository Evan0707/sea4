import React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import { Label } from './Typography'

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
    <div className={cn('w-full', className)}>
      {label && (
        <Label className="mb-1.5 block text-text-primary" weight="medium" htmlFor={inputId}>
          {label}
        </Label>
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

      {hasError && (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default Textarea