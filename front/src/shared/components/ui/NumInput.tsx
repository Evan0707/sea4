import React, { useState, useCallback } from 'react'
import { DangerCircle, ChevronUp, ChevronDown } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export type NumInputProps = {
  name: string
  label: string
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
  size = 'default'
}) => {
  const [internalValue, setInternalValue] = useState<number | ''>(defaultValue ?? '')
  const value = controlledValue ?? internalValue

  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  // Merge RHF register and external props safely
  const reg = register ?? ({} as UseFormRegisterReturn)

  const handleChange = useCallback((newValue: number | '') => {

    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }


    const numValue = newValue === '' ? 0 : newValue
    

    const syntheticEvent = {
      target: {
        name: reg.name ?? name,
        value: numValue.toString()
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>
    
    reg.onChange?.(syntheticEvent)
    onChange?.(numValue)
  }, [controlledValue, onChange, reg, name])

  const increment = () => {
    const currentValue = value === '' ? 0 : value
    const newValue = Math.min(max, currentValue + step)
    handleChange(newValue)
  }

  const decrement = () => {
    const currentValue = value === '' ? 0 : value
    const newValue = Math.max(min, currentValue - step)
    handleChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Permettre la saisie de nombres avec virgule ou point
    const cleanVal = val.replace(/,/g, '.').replace(/[^\d.-]/g, '')
    
    if (cleanVal === '' || cleanVal === '-') {
      handleChange('')
      return
    }

    const num = parseFloat(cleanVal)
    // Permettre la saisie même si temporairement hors limites
    if (!isNaN(num)) {
      handleChange(num)
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  
  // Format display value - only format when not editing
  const displayValue = isEditing 
    ? (value === '' ? '' : value.toString()) 
    : (value === '' ? '' : value.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }))

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false)
    reg.onBlur?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault() // Empêche le curseur de se déplacer
        if (e.shiftKey) {
          const currentValue = value === '' ? 0 : value
          const newValue = Math.min(max, currentValue + (step * 100))
          handleChange(newValue)
        } else {
          increment()
        }
        break
      case 'ArrowDown':
        e.preventDefault() // Empêche le curseur de se déplacer
        if (e.shiftKey) {
          const currentValue = value === '' ? 0 : value
          const newValue = Math.max(min, currentValue - (step * 100))
          handleChange(newValue)  
        } else {
          decrement()
        }
        break
    }
  }

  return (
    <div className={`${className ?? ''} ${size === 'small' ? 'flex items-center' : ''}`}>
      <label className='m-1 font-bold text-[14px]' htmlFor={inputId}>{label}</label>
      <div className={`border-[1.5px] ${hasError ? 'border-red' : 'border-border'} flex items-center rounded-md focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0`}>
        <div className="flex flex-col border-l border-border">
          <button
            type="button"
            onClick={increment}
            className="flex items-center justify-center px-2 py-0 hover:bg-gray-100 rounded-tr-sm"
          >
            <ChevronUp className="w-5 h-5 text-placeholder" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="flex items-center justify-center px-2 py-0 hover:bg-gray-100 rounded-br-sm "
          >
            <ChevronDown className="w-5 h-5 text-placeholder" />
          </button>
        </div>
        <div className={`flex flex-row items-center flex-1`}>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={`focus:outline-none px-3 flex-1 bg-transparent text-right ${size === 'small' ? 'max-w-25 h-[30px]' : 'h-[38px]'}`}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            name={reg.name ?? name}
            ref={reg.ref}
          />
          <span className="text-gray-500 mr-2">€</span>
        </div>
        
        {hasError && <DangerCircle aria-hidden className='text-red ml-2 mr-2' />}
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute'>{error}</p>
      )}
    </div>
  )
}


export default NumInput