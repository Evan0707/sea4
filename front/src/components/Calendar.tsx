import React from 'react'
import { DangerCircle, Calendar as CalendarIcon } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export type CalendarProps = {
  name: string
  label: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (date: Date | null) => void
  value?: string
  defaultValue?: string
  min?: string
  max?: string
}

const Calendar: React.FC<CalendarProps> = ({
  name,
  label,
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
  min,
  max
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  // Merge RHF register and external props safely
  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    if (onChange) {
      const date = e.target.value ? new Date(e.target.value) : null
      onChange(date)
    }
  }

  // Only pass value/defaultValue when explicitly provided
  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={`${className ?? ''}`}>
      <label className='m-1 font-bold text-[14px]' htmlFor={inputId}>{label}</label>
      <div className={`border-[1.5px] ${hasError ? 'border-red' : 'border-border'} px-3 flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0`}>
        <div className='flex flex-row items-center flex-1 relative'>
          <input
            id={inputId}
            type="date"
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={`
              focus:outline-none h-[38px] flex-1 bg-transparent
              [&::-webkit-calendar-picker-indicator]:opacity-0
              [&::-webkit-calendar-picker-indicator]:absolute
              [&::-webkit-calendar-picker-indicator]:left-0
              [&::-webkit-calendar-picker-indicator]:right-0
              [&::-webkit-calendar-picker-indicator]:cursor-pointer
            `}
            onChange={mergedOnChange}
            min={min}
            max={max}
            {...controlProps}
            name={reg.name ?? name}
            onBlur={reg.onBlur}
            ref={reg.ref}
          />
          <CalendarIcon className="text-gray-400 pointer-events-none absolute right-0" />
        </div>
        {hasError && <DangerCircle aria-hidden className='text-red ml-2' />}
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute b-0'>{error}</p>
      )}
    </div>
  )
}

export default Calendar