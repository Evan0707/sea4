import React, { type ReactNode, useState } from 'react'
import { DangerCircle, InfoCircleSolid, Eye, EyeSlash } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import Tooltip from './Tooltip'
import { Label } from './Typography'

export type InputProps = {
  name: string
  label?: string
  type: 'password' | 'text' | 'email' | 'tel' | 'date' | 'number'
  placeholder?: string
  className?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  defaultValue?: string
  info?: boolean
  message?: string
  width?: string
  onFocus?: () => void
  disabled?: boolean
  readOnly?: boolean
  onClick?: () => void
  required?: boolean
  step?: string | number
  min?: string | number
  max?: string | number
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type,
  placeholder,
  className,
  leftIcon,
  rightIcon,
  error,
  register,
  onChange,
  value,
  defaultValue,
  info = false,
  message = '',
  width = 'w-full',
  onFocus,
  disabled,
  readOnly,
  onClick,
  required,
  step,
  min,
  max,
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }

  const [showPassword, setShowPassword] = useState(false)

  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={cn('relative mb-6', width, className)}>
      {/* Label row */}
      {(label || info) && (
        <div className="flex items-center mb-1.5">
          {label && (
            <Label className="text-text-primary" weight="medium" htmlFor={inputId}>
              {label}
            </Label>
          )}
          {info && (
            <Tooltip content={message}>
              <InfoCircleSolid size={14} className="text-text-secondary ml-1.5 cursor-help" />
            </Tooltip>
          )}
        </div>
      )}

      {/* Input wrapper */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 rounded-[var(--radius)] border bg-bg-primary transition-[border-color,box-shadow]',
          'focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary',
          hasError
            ? 'border-red focus-within:ring-red/25 focus-within:border-red'
            : 'border-border',
          disabled && 'bg-bg-secondary cursor-not-allowed opacity-60'
        )}
      >
        {leftIcon && <span className="shrink-0 text-placeholder">{leftIcon}</span>}

        <input
          id={inputId}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={cn(
            'h-9 flex-1 bg-transparent text-sm text-text-primary placeholder:text-placeholder focus:outline-none',
            disabled && 'cursor-not-allowed'
          )}
          onChange={mergedOnChange}
          onFocus={onFocus}
          onClick={onClick}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          step={step}
          min={min}
          max={max}
          {...controlProps}
          name={reg.name ?? name}
          onBlur={reg.onBlur}
          ref={reg.ref}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {rightIcon && <span className="text-placeholder">{rightIcon}</span>}
          {type === 'password' && (
            <button
              type="button"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setShowPassword((s) => !s)}
              className="p-0.5 text-placeholder hover:text-text-primary transition-colors focus-visible:outline-none"
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          )}
          {hasError && <DangerCircle aria-hidden size={16} className="text-red shrink-0" />}
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input