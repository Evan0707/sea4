import { InfoCircleSolid, Calendar } from '@mynaui/icons-react'
import { useRef, useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import Tooltip from './Tooltip'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Label } from './Typography'

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
  size?: 'small' | 'default'
}

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  placeholder = 'Sélectionnez une date',
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
  size = 'default'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : defaultValue ? new Date(defaultValue) : null
  )
  const datePickerRef = useRef<ReactDatePicker>(null)

  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  const reg = register ?? ({} as UseFormRegisterReturn)

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const event = {
        target: {
          name: reg.name ?? name,
          value: formattedDate,
        },
      } as React.ChangeEvent<HTMLInputElement>
      
      reg.onChange?.(event)
      onChange?.(event)
    }
  }

  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined

  return (
    <div className={`${className ?? ''} relative w-full ${size === 'small' ? 'flex-row max-w-[300px]' : ''}`}>
      <div className='flex items-center'>
        <Label weight='bold' className='m-1 whitespace-nowrap text-[14px] text-text-primary' htmlFor={inputId}>
          {label}
        </Label>
        {info && (
          <Tooltip content={message}>
            <InfoCircleSolid size={16} className='text-placeholder' />
          </Tooltip>
        )}
      </div>
      <div
        className={`border-[1.5px] ${
          hasError ? 'border-red' : 'border-border'
        } px-3 flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] text-text-primary outline-border justify-between mt-1 mb-0 w-full`}
      >
        <ReactDatePicker
          ref={datePickerRef}
          id={inputId}
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          locale={fr}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`focus:outline-none h-[38px] px-[0px] ml-1 flex-1 bg-transparent w-full placeholder-placeholder`}
          calendarClassName="custom-datepicker"
          showPopperArrow={false}
          onBlur={reg.onBlur}
        />
        <button
          type="button"
          onClick={() => datePickerRef.current?.setFocus()}
          className="p-1 hover:bg-bg-secondary rounded transition-colors"
          aria-label="Ouvrir le calendrier"
        >
          <Calendar className="w-5 h-5 text-placeholder" />
        </button>
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute b-0'>
          {error}
        </p>
      )}
    </div>
  )
}

export default DateInput
