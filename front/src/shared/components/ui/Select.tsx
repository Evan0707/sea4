import React, { useState, useRef, useEffect } from 'react'
import { DangerCircle, ChevronDown, Check, InfoCircleSolid } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/utils'
import Tooltip from './Tooltip'
import { Label } from './Typography'
import { motion, AnimatePresence } from 'framer-motion'

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
  required?: boolean
  info?: boolean
  message?: string
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
  required = false,
  info = false,
  message = '',
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
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-[var(--radius)] border border-border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-bg-primary placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-colors hover:bg-bg-secondary/50',
          hasError && 'border-red focus:ring-red',
          isOpen && 'ring-1 ring-primary'
        )}
      >
        <span className={cn('flex-1 truncate text-left', !selectedOption && 'text-placeholder')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {hasError && <DangerCircle aria-hidden size={15} className="text-red" />}
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform duration-200',
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
          className="absolute z-50 mt-1 max-h-96 min-w-[8rem] w-full overflow-hidden rounded-md border border-border/50 bg-bg-secondary/80 backdrop-blur-lg text-text-primary shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          data-state={isOpen ? 'open' : 'closed'}
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
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-bg-secondary focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-bg-secondary transition-colors',
                    isSelected && 'bg-bg-secondary font-medium'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check
                      className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                  </span>
                  {option.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

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

export default Select