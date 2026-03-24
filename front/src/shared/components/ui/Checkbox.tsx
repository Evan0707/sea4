import React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'

export type CheckboxProps = {
  name: string
  label?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (checked: boolean) => void
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  className,
  error,
  register,
  onChange,
  checked,
  defaultChecked,
  disabled,
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e.target.checked)
  }

  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(checked !== undefined ? { checked } : {}),
    ...(defaultChecked !== undefined ? { defaultChecked } : {}),
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-center gap-2.5 cursor-pointer select-none group',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {/* Custom checkbox indicator */}
        <div className="relative shrink-0">
          <input
            id={inputId}
            type="checkbox"
            aria-invalid={hasError}
            aria-describedby={describedBy}
            disabled={disabled}
            className="peer sr-only"
            onChange={mergedOnChange}
            {...controlProps}
            name={reg.name ?? name}
            onBlur={reg.onBlur}
            ref={reg.ref}
          />
          {/* Visual box */}
          <div
            className={cn(
              'h-4 w-4 rounded-[4px] border transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1',
              hasError
                ? 'border-red peer-checked:bg-red peer-checked:border-red'
                : 'border-border peer-checked:bg-primary peer-checked:border-primary',
              'flex items-center justify-center bg-bg-primary group-hover:border-primary/60'
            )}
          >
            {/* Check SVG */}
            <svg
              className="hidden peer-checked:block w-2.5 h-2.5 text-white stroke-current"
              viewBox="0 0 10 10"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1.5,5 4,7.5 8.5,2" />
            </svg>
          </div>
        </div>

        {label && (
          <span className="text-sm text-text-primary leading-none">{label}</span>
        )}
      </label>

      {hasError && (
        <p id={describedBy} className="text-xs font-medium text-red ml-6">
          {error}
        </p>
      )}
    </div>
  )
}

export default Checkbox