import React, { useState, useRef, useEffect } from 'react'
import { DangerCircle, ChevronDown } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Label } from './Typography'

export type Option = {
  value: string
  label: string
}

export type SelectProps = {
  name: string
  label: string
  options: Option[]
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (value: string) => void
  value?: string
  defaultValue?: string,
  size?: 'small' | 'default'
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
  size = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    const initialValue = value ?? defaultValue
    return initialValue ? options.find(opt => opt.value === initialValue) ?? null : null
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


  const reg = register ?? ({} as UseFormRegisterReturn)
  
  const handleSelect = (option: Option) => {
    setSelectedOption(option)
    setIsOpen(false)
    

    const syntheticEvent = {
      target: {
        name: reg.name ?? name,
        value: option.value
      }
    } as unknown as React.ChangeEvent<HTMLSelectElement>
    
    reg.onChange?.(syntheticEvent)
    onChange?.(option.value)
  }

  return (
    <div className={`${className ?? ''} relative ${size === 'small' ? 'flex items-center' : ''}`} ref={dropdownRef}>
      <Label className='m-1 font-bold text-text-primary' weight="bold" htmlFor={inputId}>{label}</Label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`border-[1.5px] h-[40px] cursor-pointer ${hasError ? 'border-red' : 'border-border'} px-3 flex items-center rounded-[6px] hover:border-primary focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0 min-h-[38px]`}
      >
        <div className='flex flex-row items-center w-full flex-1 py-1'>
          <span className={`flex-1 overflow-hidden w-full whitespace-nowrap ${!selectedOption ? 'text-placeholder' : 'text-text-primary'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`transition-transform text-text-primary ${isOpen ? 'rotate-180' : ''}`} />
        {hasError && <DangerCircle aria-hidden className='text-red ml-2' />}
      </div>
      
      {/* Hidden native select for form handling */}
      <select
        id={inputId}
        name={reg.name ?? name}
        ref={reg.ref}
        onChange={reg.onChange}
        onBlur={reg.onBlur}
        value={selectedOption?.value ?? ''}
        className="hidden"
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-primary border border-border rounded-[6px] shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 cursor-pointer hover:bg-bg-secondary/50 text-text-primary ${
                selectedOption?.value === option.value ? 'bg-bg-secondary font-semibold' : ''
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute'>{error}</p>
      )}
    </div>
  )
}

export default Select