import React, { useState, useRef, useEffect } from 'react'
import { DangerCircle, ChevronDown, Check } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import { Label } from './Typography'

export type Option = {
  value: string
  label: string
}

export type SelectProps = {
  name: string
  label?: string
  options: Option[]
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (value: string) => void
  value?: string
  defaultValue?: string
  size?: 'small' | 'default'
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  placeholder = 'Sélectionner...',
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
  size = 'default',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    const initialValue = value ?? defaultValue
    return initialValue ? options.find((opt) => opt.value === initialValue) ?? null : null
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync controlled value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(options.find((opt) => opt.value === value) ?? null)
    }
  }, [value, options])

  const reg = register ?? ({} as UseFormRegisterReturn)

  const handleSelect = (option: Option) => {
    setSelectedOption(option)
    setIsOpen(false)

    const syntheticEvent = {
      target: { name: reg.name ?? name, value: option.value },
    } as unknown as React.ChangeEvent<HTMLSelectElement>

    reg.onChange?.(syntheticEvent)
    onChange?.(option.value)
  }

  return (
    <div
      className={cn('relative', size === 'small' && 'flex items-center gap-2', className)}
      ref={dropdownRef}
    >
      {label && (
        <Label className="mb-1.5 block text-text-primary" weight="medium" htmlFor={inputId}>
          {label}
        </Label>
      )}

      {/* Trigger */}
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={describedBy}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius)] border bg-bg-primary px-3 text-sm transition-[border-color,box-shadow] cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
          hasError
            ? 'border-red focus:ring-red/25'
            : isOpen
              ? 'border-primary ring-2 ring-primary/25'
              : 'border-border hover:border-primary/50',
          disabled && 'opacity-60 cursor-not-allowed bg-bg-secondary'
        )}
      >
        <span className={cn('flex-1 truncate text-left', !selectedOption && 'text-placeholder')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {hasError && <DangerCircle aria-hidden size={15} className="text-red" />}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-text-secondary transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Hidden native select for form compatibility */}
      <select
        name={reg.name ?? name}
        ref={reg.ref}
        onChange={reg.onChange}
        onBlur={reg.onBlur}
        value={selectedOption?.value ?? ''}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-[var(--radius)] border border-border bg-bg-primary shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => {
              const isSelected = selectedOption?.value === option.value
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-2px)] px-2 py-1.5 text-sm text-text-primary select-none transition-colors',
                    isSelected
                      ? 'bg-primary/8 text-primary font-medium'
                      : 'hover:bg-bg-secondary'
                  )}
                >
                  <Check
                    className={cn('w-4 h-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasError && (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default Select