import React, { useState, useCallback } from 'react'
import { DangerCircle, ChevronUp, ChevronDown } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import { Label } from './Typography'

export type NumInputProps = {
  name: string
  label?: string
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (value: number) => void
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  size?: 'small' | 'default'
  unit?: string
}

const NumInput: React.FC<NumInputProps> = ({
  name,
  label,
  placeholder,
  className,
  error,
  register,
  onChange,
  value: controlledValue,
  defaultValue,
  min = 0,
  max = 999999.99,
  step = 0.01,
  size = 'default',
  unit = '€',
}) => {
  const [internalValue, setInternalValue] = useState<number | ''>(defaultValue ?? '')
  const value = controlledValue ?? internalValue

  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)

  const handleChange = useCallback((newValue: number | '') => {
    if (controlledValue === undefined) setInternalValue(newValue)
    const numValue = newValue === '' ? 0 : newValue
    const syntheticEvent = {
      target: { name: reg.name ?? name, value: numValue.toString() },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    reg.onChange?.(syntheticEvent)
    onChange?.(numValue)
  }, [controlledValue, onChange, reg, name])

  const increment = () => {
    const current = value === '' ? 0 : value
    handleChange(parseFloat(Math.min(max, current + step).toFixed(10)))
  }
  const decrement = () => {
    const current = value === '' ? 0 : value
    handleChange(parseFloat(Math.max(min, current - step).toFixed(10)))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/,/g, '.').replace(/[^\d.-]/g, '')
    if (cleanVal === '' || cleanVal === '-') { handleChange(''); return }
    const num = parseFloat(cleanVal)
    if (!isNaN(num)) handleChange(num)
  }

  const [isEditing, setIsEditing] = useState(false)
  const displayValue = isEditing
    ? (value === '' ? '' : value.toString())
    : (value === '' ? '' : (value as number).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false)
    reg.onBlur?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); e.shiftKey ? handleChange(parseFloat(Math.min(max, (value === '' ? 0 : value) + step * 100).toFixed(10))) : increment() }
    if (e.key === 'ArrowDown') { e.preventDefault(); e.shiftKey ? handleChange(parseFloat(Math.max(min, (value === '' ? 0 : value) - step * 100).toFixed(10))) : decrement() }
  }

  return (
    <div className={cn(size === 'small' && 'flex items-center gap-2', className)}>
      {label && (
        <Label className="block mb-1.5 text-text-primary" weight="medium" htmlFor={inputId}>
          {label}
        </Label>
      )}

      <div
        className={cn(
          'flex items-center rounded-[var(--radius)] border bg-bg-primary transition-[border-color,box-shadow]',
          'focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary',
          hasError ? 'border-red focus-within:ring-red/25 focus-within:border-red' : 'border-border'
        )}
      >
        {/* Stepper buttons — gauche */}
        <div className="flex flex-col border-r border-border/60 shrink-0">
          <button
            type="button"
            onClick={increment}
            tabIndex={-1}
            className="flex items-center justify-center px-2 py-0.5 hover:bg-bg-secondary transition-colors rounded-tr-[calc(var(--radius)-2px)]"
            aria-label="Augmenter"
          >
            <ChevronUp className="w-3.5 h-3.5 text-placeholder" />
          </button>
          <button
            type="button"
            onClick={decrement}
            tabIndex={-1}
            className="flex items-center justify-center px-2 py-0.5 hover:bg-bg-secondary transition-colors rounded-br-[calc(var(--radius)-2px)]"
            aria-label="Diminuer"
          >
            <ChevronDown className="w-3.5 h-3.5 text-placeholder" />
          </button>
        </div>

        {/* Input */}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={cn(
            'flex-1 bg-transparent px-3 text-right text-sm text-text-primary placeholder:text-placeholder focus:outline-none',
            size === 'small' ? 'h-8 max-w-[100px]' : 'h-9'
          )}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          name={reg.name ?? name}
          ref={reg.ref}
        />

        {/* Unit + error icon */}
        <div className="flex items-center gap-1 pr-3 shrink-0">
          <span className="text-sm text-text-secondary">{unit}</span>
          {hasError && <DangerCircle aria-hidden size={15} className="text-red" />}
        </div>
      </div>

      {hasError && (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default NumInput