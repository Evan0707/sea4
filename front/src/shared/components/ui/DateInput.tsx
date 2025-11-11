import { InfoCircleSolid } from '@mynaui/icons-react'
import { useEffect, useRef, useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import Tooltip from './Tooltip'

export type DateInputProps = {
  name: string
  label: string
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  defaultValue?: string
  info?: boolean
  message?: string
  min?: string
  max?: string
}

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  placeholder,
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
  info = false,
  message = '',
  min,
  max,
}) => {
  const [dateError, setDateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceTimer = useRef<number | null>(null)

  const hasError = Boolean(error || dateError)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)
  
  // Validation de la date avec debounce
  useEffect(() => {
    const validateDate = () => {
      if (!inputRef.current) return
      
      const inputValue = inputRef.current.value
      if (!inputValue) {
        setDateError(null)
        return
      }

      const selectedDate = new Date(inputValue)
      
      // Vérifier min
      if (min) {
        const minDate = new Date(min)
        if (selectedDate < minDate) {
          setDateError(`La date doit être après le ${new Date(min).toLocaleDateString('fr-FR')}`)
          inputRef.current.classList.add('border-red')
          return
        }
      }
      
      // Vérifier max
      if (max) {
        const maxDate = new Date(max)
        if (selectedDate > maxDate) {
          setDateError(`La date doit être avant le ${new Date(max).toLocaleDateString('fr-FR')}`)
          inputRef.current.classList.add('border-red')
          return
        }
      }

      setDateError(null)
      inputRef.current.classList.remove('border-red')
    }

    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = window.setTimeout(() => {
      validateDate()
    }, 300)

    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value, min, max])

  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }

  const mergedRef = (element: HTMLInputElement | null) => {
    inputRef.current = element
    if (typeof reg.ref === 'function') {
      reg.ref(element)
    }
  }

  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
  }

  return (
    <div className={`${className ?? ''} relative w-full`}>
      <div className='flex items-center'>
        <label className='m-1 font-bold text-[14px]' htmlFor={inputId}>
          {label}
        </label>
        {info && (
          <Tooltip content={message}>
            <InfoCircleSolid size={16} className='color-placeholder' />
          </Tooltip>
        )}
      </div>
      <div
        className={`border-[1.5px] ${
          hasError ? 'border-red' : 'border-border'
        } px-3 flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0 w-full`}
      >
        <input
          id={inputId}
          type="date"
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`focus:outline-none h-[38px] px-[0px] ml-1 flex-1 bg-transparent w-full`}
          onChange={mergedOnChange}
          {...controlProps}
          name={reg.name ?? name}
          onBlur={reg.onBlur}
          ref={mergedRef}
        />
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute b-0'>
          {error || dateError}
        </p>
      )}
    </div>
  )
}

export default DateInput
